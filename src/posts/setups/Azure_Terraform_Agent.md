# Running Terraform Cloud Agents on Azure VMs (While We Prepare for AKS)

Our long-term goal is to run our Terraform Cloud Agents on **Azure Kubernetes Service (AKS)**, managed through **Helm** for full scalability and automation.

However, while we finalize our AKS setup and deployment automation, we want to enable our developers to quickly get started and run agents in a consistent way.

This guide describes our temporary solution: running the agent on an Azure VM using systemd, Docker, and securely retrieving agent tokens from Azure Key Vault.

We are using an `ubuntu-24_04-lts` VM image for this process.

This approach is intended as a bridge—**simple to set up, secure, and disposable**—while we work toward our long-term platform.

---

## Overview

This guide walks you through a secure, repeatable way to run [Terraform Cloud Agents](https://developer.hashicorp.com/terraform/cloud-docs/agents) on Azure VMs. We use:

- **Azure Key Vault** to store secrets
- **Azure VM Managed Identity** for authentication (no credentials on disk)
- **systemd** for automated and reliable startup
- **Docker** to run the agent container

This lets you get a running agent with minimal manual steps, while keeping secrets out of plain text.

---

## Prerequisites

- Azure VM (Ubuntu 24.04 LTS recommended) with [Docker](https://docs.docker.com/engine/install/ubuntu/) installed
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-linux?pivots=apt) (instructions below)
- The VM must have a [System Assigned Managed Identity](https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview) enabled
- The VM’s managed identity must have **Get** and **List** permission for your Key Vault secret (Terraform Cloud agent token)
- The agent token must already exist as a secret in your Key Vault

---

## Install Azure CLI

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

---

## Create the Agent Startup Script

We’ll write a simple shell script to:
- Authenticate with Azure using the VM’s managed identity
- Pull the agent token from Key Vault
- Run the Docker container with the required environment variables

```bash
sudo nano /usr/local/bin/start-tfc-agent.sh
```

Paste in the following script, and **update the three variables near the top** (`KEYVAULT_NAME`, `SECRET_NAME`, and `AGENT_NAME`):

```bash
#!/bin/bash
set -e

# Authenticate as the VM's managed identity (no user login required)
az login --identity

# CONFIGURE THESE VALUES
KEYVAULT_NAME="your-keyvault-name"      # <-- your Key Vault name
SECRET_NAME="tfc-agent-token"           # <-- your secret name in Key Vault
AGENT_NAME="Agent007"                   # <-- whatever you want your agent to be called

# Get the token from Key Vault using the VM's managed identity
TOKEN=$(az keyvault secret show --vault-name "$KEYVAULT_NAME" --name "$SECRET_NAME" --query value -o tsv)

# Run the Docker container with the retrieved token
docker run --rm --name tfc-agent   -e TFC_AGENT_TOKEN="$TOKEN"   -e TFC_AGENT_NAME="$AGENT_NAME"   hashicorp/tfc-agent:latest
```

Save and exit (`Ctrl+O`, then `Enter`, then `Ctrl+X`).

---

## Make the Script Executable

```bash
sudo chmod +x /usr/local/bin/start-tfc-agent.sh
```

---

## Create the systemd Service

This service will ensure your agent starts up automatically on every VM boot/restart.

```bash
sudo nano /etc/systemd/system/tfc-agent-docker.service
```

Paste in:

```ini
[Unit]
Description=Terraform Cloud Agent (Docker)
After=docker.service
Requires=docker.service

[Service]
Restart=always
ExecStartPre=-/usr/bin/docker rm -f tfc-agent
ExecStart=/usr/local/bin/start-tfc-agent.sh
ExecStop=/usr/bin/docker stop tfc-agent

[Install]
WantedBy=multi-user.target
```

> **Note:**  
> If your script or Docker are in different locations, adjust the paths above.

Save and exit.

---

## Reload systemd

```bash
sudo systemctl daemon-reload
```

---

## Enable and Start the Service

```bash
sudo systemctl enable tfc-agent-docker
sudo systemctl start tfc-agent-docker
```

---

## Check Service Status

```bash
sudo systemctl status tfc-agent-docker
```
You should see `active (running)` if everything is working.

---

## Testing & Troubleshooting

- **Reboot your VM** to ensure the service runs on startup:
  ```bash
  sudo reboot
  ```

- **After reboot, check:**
  ```bash
  sudo systemctl status tfc-agent-docker
  sudo docker ps
  ```
  You should see your `tfc-agent` container running.

- **To see logs:**
  ```bash
  sudo journalctl -u tfc-agent-docker
  ```

- **If the agent doesn’t start:**
  - Double-check the secret name and Key Vault name in your script.
  - Try running the script manually to see error output:
    ```bash
    sudo /usr/local/bin/start-tfc-agent.sh
    ```
  - Confirm your VM’s managed identity has Key Vault **Get** permission.
  - Make sure your agent token is valid in Terraform Cloud.

---

## Final Notes

- **Security:** This approach keeps us from having to store our Terraform Cloud Agent token in plain text, by retrieving it securely from Azure Key Vault at runtime using managed identity.
- **Temporary:** This setup is meant as a bridge while we move to AKS + Helm for full automation and scalability.
- **Clean up:** When you no longer need the VM-based agent, simply stop and disable the systemd service, or delete the VM.

---

If you want a bit of a deeper dive into systemd, check this out: [Creating and Managing Custom systemd Services on Ubuntu](https://dev.to/edgaras/creating-and-managing-custom-systemd-services-on-ubuntu-dkh)

---
