import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    user: String,
    remoteToken: String,
    remoteChainId: Number,
    amount: String,
});

export const User = mongoose.model('User', userSchema);