import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 'VIEW',
      'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE',
      'ROLE_CHANGE', 'STATUS_CHANGE',
      'DISPENSE', 'RESTOCK', 'PRICE_CHANGE',
      'ORDER_STATUS_CHANGE', 'PRESCRIPTION_VERIFY',
      'SETTINGS_CHANGE', 'EXPORT', 'IMPORT'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: ['User', 'Medicine', 'Order', 'Prescription', 'Patient', 'Category', 'Supplier', 'Settings', 'System']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// Static method to create audit log
auditLogSchema.statics.log = async function(data) {
  return await this.create(data);
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
