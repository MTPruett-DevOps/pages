import React from "react";
import { Link } from "react-router-dom";

export default function about() {
  return (
    <div>
      <h2 ><Link to="/">About</Link> / <Link to="/docs">Docs</Link></h2>

      <p>I'm a DevOps engineer who lives in Azure, Terraform, and Databricks.</p>

      <p>
        Most of my day-to-day is spent building cloud infrastructure that doesn't fall apart under pressure — automating the boring stuff, tightening up CI/CD pipelines, managing Databricks (Unity Catalog included), and helping teams move faster without breaking things. If there's a way to script it, automate it, or monitor it... I'm on it.
      </p>

      <p>
        I've learned (sometimes the hard way) how to keep cloud environments clean, secure, and scalable. Most of us don’t get to pick our stack — we use what the job calls for. This blog reflects that: the tools I’ve used, the problems I’ve hit, and the stuff I wish I knew sooner.
      </p>

      <p>
        The cloud’s always changing — and sometimes (more than we'd like) it breaks. This blog is where I share what I’m learning, what I’ve messed up, and what actually works. If it saves you some pain, that’s a win.
      </p>

      <h3>What I use a lot:</h3>
      <ul>
        <li>Azure (infra, security, automation, monitoring — the usual suspects)</li>
        <li>Terraform (IaC modules, state management, CI integration)</li>
        <li>Databricks (workspace admin, Unity Catalog, job orchestration, ACLs)</li>
        <li>CI/CD: GitHub Actions, Azure DevOps, Octopus</li>
        <li>Scripting: PowerShell, Bash, SQL, Git, C# (primarily for internal tooling, not full-scale development)</li>
        <li>Tooling: VS Code, Git, terminal life</li>
      </ul>

      <p>Thanks for dropping by.</p>

      <p>
        Just a heads up — I assume tools like Terraform, Git, VS Code, and any CLIs are already installed if you’re following along. I'll try to skip the setup fluff and get right to the good stuff.
      </p>

      <p>
        I take security seriously — so all sensitive tokens will be scrubbed out, and if I’m sharing real-world configs, resource names and GUIDs will be too. Sometimes it might feel like overkill, but better safe than sorry.
      </p>
    </div>
  );
}