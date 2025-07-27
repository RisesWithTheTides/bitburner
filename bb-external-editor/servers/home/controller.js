/** @param {NS} ns */
export async function main(ns) {
    const target = "joesguns";

    const growScript = "grow.js";
    const weakenScript = "weaken.js";
    const hackScript = "hack.js";

    const minSec = ns.getServerMinSecurityLevel(target);
    const maxMoney = ns.getServerMaxMoney(target);

    const ramAvailable = ns.getServerMaxRam(ns.getHostname());
    const ramUsed = ns.getServerUsedRam(ns.getHostname());
    const freeRam = ramAvailable - ramUsed;

    const growRam = ns.getScriptRam(growScript);
    const weakenRam = ns.getScriptRam(weakenScript);
    const hackRam = ns.getScriptRam(hackScript);

    while (true) {
        const security = ns.getServerSecurityLevel(target);
        const money = ns.getServerMoneyAvailable(target);

        if (security > minSec + 5) {
            const threads = Math.floor(freeRam / weakenRam);
            if (threads > 0) ns.exec(weakenScript, ns.getHostname(), threads, target);
        } else if (money < maxMoney * 0.9) {
            const threads = Math.floor(freeRam / growRam);
            if (threads > 0) ns.exec(growScript, ns.getHostname(), threads, target);
        } else {
            const threads = Math.floor(freeRam / hackRam);
            if (threads > 0) ns.exec(hackScript, ns.getHostname(), threads, target);
        }

        await ns.sleep(1000);
    }
}
