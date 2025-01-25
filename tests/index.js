const chai = require("chai");

(async () => {
    const chaiAsPromised = await import("chai-as-promised");
    chai.use(chaiAsPromised.default);
})();
