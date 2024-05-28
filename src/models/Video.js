import mongoose from 'mongoose';


const videoSchema = new mongoose.Schema({
  title: {type: String, required: true, trim:true, maxLength: 80},
  fileUrl: {type: String, required: true} ,
  description: {type: String, required: true, trim:true, minLength: 1},
  createdAt: {type: Date, required: true, default: Date.now}, // 매번 설정해주지 않으려 default값으로 날짜 설정. 단, Date.now()는 함수를 바로 실행시키므로 내가 새로운 Video를 만들 때만 실행될 수 있도록 Date.now로 적어준다.
  hashtags: [{ type: String, trim:true }], //배열로 설정하기 위해 [] 사용
  meta: {
    views: {type: Number, default: 0, required: true},
    rating: {type: Number, default: 0, required: true},
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});


videoSchema.static('formatHashtags', function(hashtags) {
  return hashtags.split(',').map((word) => (word.startsWith('#') ? word : `#${word}`));
})


// 위에서 정의한 스키마를 사용하기 위해서 Schema를 Model로 변환해줘야 한다 => mongoose.model(modelName, schema)
const Video = mongoose.model('Video', videoSchema);

export default Video;
