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
      <h2>About Me</h2>
      <p>
        I'm a DevOps engineer focused on building secure, scalable, and reliable cloud infrastructure — primarily in Azure, Terraform, and Databricks.
      </p>

      <p>
        Most of my day-to-day work is spent automating deployments, tightening CI/CD pipelines, managing Databricks environments (including Unity Catalog),
        and helping teams move faster without breaking things. If there's a way to script it, automate it, or monitor it... I'm on it.
      </p>
      
      <p>
        The cloud’s always changing — and sometimes (more than we'd like) it breaks. I decided to put this together to keep track of what I’m learning, the problems I’ve hit, and what
        actually works. If it saves you some pain, that’s a win.
      </p>

      <h3>What I work with a lot:</h3>
      <ul>
        <li><strong>Cloud:</strong> Azure</li>
        <li><strong>Infrastructure as Code:</strong> Terraform</li>
        <li><strong>Data Platforms:</strong> Databricks (admin + Unity Catalog)</li>
        <li><strong>CI/CD:</strong> GitHub Actions, Azure DevOps, Octopus Deploy</li>
        <li><strong>Scripting:</strong> PowerShell, Bash, SQL, Git, C#</li>
        <li><strong>Tooling:</strong> VS Code, CLI workflows, terminal life</li>
      </ul>

      <p>
        I'm careful with security — all examples scrub sensitive info, resource names, and GUIDs. Sometimes it might seem like overkill, but I'd rather play it safe.
      </p>

      <p>
        Thanks for stopping by.
      </p>
    </div>
  );
}