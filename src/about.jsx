import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function About({ setPage }) {
  const navigate = useNavigate();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const handleClick = () => {
    setPage('docs');
    navigate('/docs');
  };

  useEffect(() => {
    setIsFirstLoad(false);
  }, []);

  return (
    <div className={`about-wrapper ${isFirstLoad ? '' : 'fade-in-up'}`}>

    <p>I'm a DevOps engineer who lives in Azure, Terraform, and Databricks.</p>
      
    <p>
      Most of my day-to-day is spent building cloud infrastructure that doesn't fall apart under pressure —
      automating the boring stuff, tightening up CI/CD pipelines, managing Databricks (Unity Catalog included),
      and helping teams move faster without breaking things.
    </p>
      
    <p>
      I've learned (sometimes the hard way) how to keep cloud environments clean, secure, and scalable.
      This blog reflects that: the tools I’ve used, the problems I’ve hit, and the stuff I wish I knew sooner.
    </p>
      
    <p>
      The cloud’s always changing — and sometimes (more than we'd like) it breaks. This blog is where I share what I’m learning,
      what I’ve messed up, and what actually works. If it saves you some pain, that’s a win.
    </p>
      
    <h3>What I use a lot:</h3>
    <ul>
      <li>Azure</li>
      <li>Terraform</li>
      <li>Databricks</li>
      <li>CI/CD: GitHub Actions, Azure DevOps, Octopus</li>
      <li>Scripting: PowerShell, Bash, SQL, Git, C#</li>
      <li>Tooling: VS Code, Git, terminal life</li>
    </ul>
      
    <p>Thanks for dropping by.</p>
      
    <p>
      Just a heads up — I assume tools like Terraform, Git, VS Code, and any CLIs are already installed if you’re following along.
      I'll try to skip the setup fluff and get right to the good stuff.
    </p>
      
    <p>
      I take security seriously — so all sensitive tokens will be scrubbed out, and if I’m sharing real-world configs,
      resource names and GUIDs will be too. Sometimes it might feel like overkill, but better safe than sorry.
    </p>
    </div>
  );
}