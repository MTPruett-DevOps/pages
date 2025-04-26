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

      <p>
        I'm a DevOps engineer who lives in Azure, Terraform, and Databricks.
      </p>
      <p>
        Most of my day-to-day is spent building cloud infrastructure that doesn't fall apart under pressure —
        automating the boring stuff, tightening up CI/CD pipelines, managing Databricks (Unity Catalog included),
        and helping teams move faster without breaking things. If there's a way to script it, automate it, or monitor it... I'm on it.
      </p>
      <p>
        I've learned (sometimes the hard way) how to keep cloud environments clean, secure, and scalable.
        Most of us don’t get to pick our stack — we use what the job calls for. This blog reflects that:
        the tools I’ve used, the problems I’ve hit, and the stuff I wish I knew sooner.
      </p>
      <p>
        The cloud’s always changing — and let’s be honest, sometimes it breaks. This blog is where I share what I’m learning,
        what I’ve messed up, and what actually works. If it saves you some pain, that’s a win.
      </p>
    </div>
  );
}