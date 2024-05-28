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

// users collection에 데이터를 저장하기 전 password 해시 후 저장
// this는 Users가 create될 때 유저가 입력한 value
// 계정 생성이나 password 수정할 때를 제외한 user.save() 사용 시 이미 hash된 password가 또 hash되지 않도록 isModified()함수로 해당 항목에 변경이 일어날 때만 동작하도록 설정
userSchema.pre('save', async function() {
  if(this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 5);
  }
})

const User = mongoose.model('User', userSchema);
export default User;