import sleep from "yaku/lib/sleep";
 
module.exports = async it => {
    await sleep(3000);
 
    it("fib 01", () => eq(1 + 1, 2));
 
    it("fib 02", () => eq(1 + 2, 3));
 
    it("fib 03", () => eq(2 + 3, 5));
    };
