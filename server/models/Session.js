import mongoose from 'mongoose';
import crypto from 'crypto';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType'
    },
    userType: {
        type: String,
        required: true,
        enum: ['User', 'Clinic', 'Patient']
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
        default: () => crypto.randomUUID()
    },
    accessTokenHash: {
        type: String,
        required: true
    },
    refreshTokenHash: {
        type: String,
        required: true
    },
    deviceInfo: {
        browser: String,
        os: String,
        ip: String,
        userAgent: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    loggedOutAt: Date,
    logoutReason: {
        type: String,
        enum: ['manual', 'expired', 'forced', 'new_device', 'admin_forced']
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
sessionSchema.index({ userId: 1, isActive: 1 });

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Hash a token for storage
sessionSchema.statics.hashToken = function (token) {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Create a new session (kills existing sessions for single-device)
sessionSchema.statics.createSession = async function (data) {
    const { userId, userType, accessToken, refreshToken, deviceInfo, expiresIn } = data;

    // Kill all existing active sessions for this user (single-device enforcement)
    await this.updateMany(
        { userId, isActive: true },
        {
            isActive: false,
            loggedOutAt: new Date(),
            logoutReason: 'new_device'
        }
    );

    // Create new session
    const session = await this.create({
        userId,
        userType,
        accessTokenHash: this.hashToken(accessToken),
        refreshTokenHash: this.hashToken(refreshToken),
        deviceInfo,
        expiresAt: new Date(Date.now() + (expiresIn || 7 * 24 * 60 * 60 * 1000)) // Default 7 days
    });

    return session;
};

// Validate session by token
sessionSchema.statics.validateSession = async function (accessToken) {
    const tokenHash = this.hashToken(accessToken);
    const session = await this.findOne({
        accessTokenHash: tokenHash,
        isActive: true,
        expiresAt: { $gt: new Date() }
    });

    if (session) {
        // Update last activity
        session.lastActivityAt = new Date();
        await session.save();
    }

    return session;
};

// Destroy session (logout)
sessionSchema.statics.destroySession = async function (accessToken, reason = 'manual') {
    const tokenHash = this.hashToken(accessToken);
    return await this.findOneAndUpdate(
        { accessTokenHash: tokenHash },
        {
            isActive: false,
            loggedOutAt: new Date(),
            logoutReason: reason
        }
    );
};

// Destroy all sessions for a user (admin force logout)
sessionSchema.statics.destroyAllUserSessions = async function (userId, reason = 'admin_forced') {
    return await this.updateMany(
        { userId, isActive: true },
        {
            isActive: false,
            loggedOutAt: new Date(),
            logoutReason: reason
        }
    );
};

// Get active sessions for a user
sessionSchema.statics.getActiveSessions = async function (userId) {
    return await this.find({ userId, isActive: true });
};

// Get all active sessions (admin)
sessionSchema.statics.getAllActiveSessions = async function () {
    return await this.find({ isActive: true })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
