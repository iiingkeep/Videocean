// js와 css파일의 폴더 분리를 위해 사용
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

// webpack이 읽을 configuration 파일 내보내기
// export default. endtry와 output 설정
module.exports = {
  entry: {
    main: './src/client/js/main.js', // 변경하려는 기본 파일
    videoPlayer: './src/client/js/videoPlayer.js',
  },
  mode: 'development',
  watch: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  output: { // 변경작업이 끝난 파일 이름과 경로 설정
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: { // 작업환경 설정
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", {
          loader: "sass-loader",
          options: {
            sassOptions: {
              includePaths: ["./src/client/scss"]
            }
          }
        }
      ],
      },
    ],
  },
}

// webpack은 코드를 각각의 loader로 가공해 변환 코드를 생성(번들링)
// webpack은 코드를 뒤에서부터 시작하므로 use의 loader 입력 시 가장 먼저 실행되는 것을 나중에, 가장 나중에 실행되는 것을 처음에 입력