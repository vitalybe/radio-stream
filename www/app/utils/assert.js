export default function assert(condition, message) {
    if (!condition) {
        throw Error(message || "Assertion failed");
    }
}