import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: {type: String, required: true, unique: true},
  avatarUrl: String,
  socialOnly: {type: Boolean, default: false},
  username: {type: String, required: true, unique: true},
  password: {type: String},
  name: {type: String, required: true},
  location: String,
  videos: [{type: mongoose.Schema.Types.ObjectId, ref: 'Video'}]
});

// this는 Users가 create될 때 유저가 입력한 value
userSchema.pre('save', async function() {
  this.password = await bcrypt.hash(this.password, 5);
})

const User = mongoose.model('User', userSchema);
export default User;