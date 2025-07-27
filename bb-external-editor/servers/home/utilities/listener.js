/** @param {NS} ns */
export async function main(ns) {
    let lastLevel = ns.getHackingLevel();

    while (true) {
        const currentLevel = ns.getHackingLevel();

        if (currentLevel > lastLevel) {
            ns.tprint(`📈 Hacking level increased: ${lastLevel} → ${currentLevel}`);
            lastLevel = currentLevel;

            // Do something when level increases:
            
        }

        await ns.sleep(2000); // check every 2 seconds
    }
}

