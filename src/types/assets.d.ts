// 音频资源模块声明（Expo 的 expo/types 未声明 .wav）
// 原生端 require 返回资源 ID（number），网页端返回 URL（string）。
declare module '*.wav' {
  const asset: number | string;
  export default asset;
}
