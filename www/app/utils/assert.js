export default function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}