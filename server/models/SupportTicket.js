import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['order', 'prescription', 'payment', 'delivery', 'account', 'medicine', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  responses: [{
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'responses.respondedByModel'
    },
    respondedByModel: {
      type: String,
      enum: ['User', 'Patient']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true
});

supportTicketSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    this.ticketNumber = `TKT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
