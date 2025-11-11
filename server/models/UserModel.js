import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expiresAt: Date
    },
    resetPasswordToken: {
        token: String,
        expiresAt: Date
    },
    tier: {
        type: String,
        enum: ['basic', 'pro', 'ultimate'],
        default: 'basic',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
})

const User = mongoose.model('User', userSchema);
export default User;