/** @param {NS} ns */
export async function main(ns) {
    while(true) {
      const dfs = (startHost) => {
          const hosts = new Set([startHost]);
          for (const host of hosts) {ns.scan(host).forEach(n => hosts.add(n));}
          return [...hosts];
      };

      function Breach(ns, server) {
        try { ns.brutessh(server); } catch { }
        try { ns.ftpcrack(server); } catch { }
        try { ns.relaysmtp(server); } catch { }
        try { ns.httpworm(server); } catch { }
        try { ns.sqlinject(server); } catch { }
        try { ns.nuke(server); } catch { }

        return ns.hasRootAccess(server);
      }

      const dfshost = ns.args[0] || "home";
      const servers = dfs(dfshost);
      const rootedServers = [];
      let rooted = 0;
      let newlyRooted = 0;

      for (const server of servers) {
        if (ns.hasRootAccess(server)) {
          rooted++;
          rootedServers.push(server);
        }
        else if (await Breach(ns, server) == true) {
          ns.tprint('✅ SUCCESS: Rooted new server: ' + server);
          newlyRooted++;
          rootedServers.push(server);
        }

      }
      ns.tprint("📊 Already Rooted: " + rooted);
      ns.tprint("🆕 Newly Rooted: " + newlyRooted);
      ns.tprint("📁 Rooted Servers: " + rootedServers.sort().join(", "));
      const filesToDeploy = ["controller.js","hack.js","weaken.js", "grow.js"];
      const encodedServers = JSON.stringify(rootedServers);

      ns.exec("deployer.js", "home", 1, encodedServers, ...filesToDeploy);
      await ns.sleep(60000); // Wait 1 minute before repeating
    }
}