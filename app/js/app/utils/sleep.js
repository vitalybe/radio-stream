export default function sleep(millisecond) {
  return new Promise(resolve => setTimeout(resolve, millisecond));
}
