import type { SecurityBlacklistConfig } from '@lobechat/types';

/**
 * Default Security Blacklist
 * These rules will ALWAYS block execution and require human intervention,
 * regardless of user settings (even in auto-run mode)
 *
 * This is the last line of defense against dangerous operations
 */
export const DEFAULT_SECURITY_BLACKLIST: SecurityBlacklistConfig = [
  // ==================== File System Dangers ====================
  {
    description: 'Recursive deletion of home directory is extremely dangerous',
    match: {
      command: {
        pattern: 'rm.*-r.*(~|\\$HOME|/Users/[^/]+|/home/[^/]+)/?\\s*$',
        type: 'regex',
      },
    },
  },
  {
    description: 'Recursive deletion of root directory will destroy the system',
    match: {
      command: {
        pattern: 'rm.*-r.*/\\s*$',
        type: 'regex',
      },
    },
  },
  {
    description: 'Force recursive deletion without specific target is too dangerous',
    match: {
      command: {
        pattern: 'rm\\s+-rf\\s+[~./]\\s*$',
        type: 'regex',
      },
    },
  },

  // ==================== System Configuration Dangers ====================
  {
    description: 'Modifying /etc/passwd could lock you out of the system',
    match: {
      command: {
        pattern: '.*(/etc/passwd|/etc/shadow).*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Modifying sudoers file without proper validation is dangerous',
    match: {
      command: {
        pattern: '.*/etc/sudoers.*',
        type: 'regex',
      },
    },
  },

  // ==================== Dangerous Commands ====================
  {
    description: 'Fork bomb can crash the system',
    match: {
      command: {
        pattern: '.*:\\(\\).*\\{.*\\|.*&.*\\};.*:.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Writing random data to disk devices can destroy data',
    match: {
      command: {
        pattern: 'dd.*of=/dev/(sd|hd|nvme).*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Formatting system partitions will destroy data',
    match: {
      command: {
        pattern: '(mkfs|fdisk|parted).*(/dev/(sd|hd|nvme)|/)',
        type: 'regex',
      },
    },
  },

  // ==================== Network & Remote Access Dangers ====================
  {
    description: 'Disabling firewall exposes system to attacks',
    match: {
      command: {
        pattern: '(ufw\\s+disable|iptables\\s+-F|systemctl\\s+stop\\s+firewalld)',
        type: 'regex',
      },
    },
  },
  {
    description: 'Changing SSH configuration could lock you out',
    match: {
      command: {
        pattern: '.*(/etc/ssh/sshd_config).*',
        type: 'regex',
      },
    },
  },

  // ==================== Package Manager Dangers ====================
  {
    description: 'Removing essential system packages can break the system',
    match: {
      command: {
        pattern: '(apt|yum|dnf|pacman)\\s+(remove|purge|erase).*(systemd|kernel|glibc|bash|sudo)',
        type: 'regex',
      },
    },
  },

  // ==================== Kernel & System Core Dangers ====================
  {
    description: 'Modifying kernel parameters without understanding can crash the system',
    match: {
      command: {
        pattern: 'echo.*>/proc/sys/.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Direct memory access is extremely dangerous',
    match: {
      command: {
        pattern: '.*(/dev/(mem|kmem|port)).*',
        type: 'regex',
      },
    },
  },

  // ==================== Privilege Escalation Dangers ====================
  {
    description: 'Changing file ownership of system directories is dangerous',
    match: {
      command: {
        pattern: 'chown.*-R.*(/(etc|bin|sbin|usr|var|sys|proc)|~).*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Setting SUID on shells or interpreters is a security risk',
    match: {
      command: {
        pattern: 'chmod.*(4755|u\\+s).*(sh|bash|python|perl|ruby|node)',
        type: 'regex',
      },
    },
  },

  // ==================== Sensitive Information Leakage ====================
  {
    description: 'Reading .env files may leak sensitive credentials and API keys',
    match: {
      command: {
        pattern: '(cat|less|more|head|tail|vim|nano|vi|emacs|code).*\\.env.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading .env files may leak sensitive credentials and API keys',
    match: {
      path: {
        pattern: '.*\\.env.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading SSH private keys can compromise system security',
    match: {
      command: {
        pattern:
          '(cat|less|more|head|tail|vim|nano|vi|emacs|code).*(id_rsa|id_ed25519|id_ecdsa)(?!\\.pub).*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading SSH private keys can compromise system security',
    match: {
      path: {
        pattern: '.*/\\.ssh/(id_rsa|id_ed25519|id_ecdsa)$',
        type: 'regex',
      },
    },
  },
  {
    description: 'Accessing AWS credentials can leak cloud access keys',
    match: {
      command: {
        pattern: '(cat|less|more|head|tail|vim|nano|vi|emacs|code).*/\\.aws/credentials.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Accessing AWS credentials can leak cloud access keys',
    match: {
      path: {
        pattern: '.*/\\.aws/credentials.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading Docker config may expose registry credentials',
    match: {
      command: {
        pattern: '(cat|less|more|head|tail|vim|nano|vi|emacs|code).*/\\.docker/config\\.json.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading Docker config may expose registry credentials',
    match: {
      path: {
        pattern: '.*/\\.docker/config\\.json$',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading Kubernetes config may expose cluster credentials',
    match: {
      command: {
        pattern: '(cat|less|more|head|tail|vim|nano|vi|emacs|code).*/\\.kube/config.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading Kubernetes config may expose cluster credentials',
    match: {
      path: {
        pattern: '.*/\\.kube/config$',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading Git credentials file may leak access tokens',
    match: {
      command: {
        pattern: '(cat|less|more|head|tail|vim|nano|vi|emacs|code).*/\\.git-credentials.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading Git credentials file may leak access tokens',
    match: {
      path: {
        pattern: '.*/\\.git-credentials$',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading npm token file may expose package registry credentials',
    match: {
      command: {
        pattern: '(cat|less|more|head|tail|vim|nano|vi|emacs|code).*/\\.npmrc.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading npm token file may expose package registry credentials',
    match: {
      path: {
        pattern: '.*/\\.npmrc$',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading history files may expose sensitive commands and credentials',
    match: {
      command: {
        pattern:
          '(cat|less|more|head|tail|vim|nano|vi|emacs|code).*/\\.(bash_history|zsh_history|history).*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading history files may expose sensitive commands and credentials',
    match: {
      path: {
        pattern: '.*/\\.(bash_history|zsh_history|history)$',
        type: 'regex',
      },
    },
  },
  {
    description: 'Accessing browser credential storage may leak passwords',
    match: {
      command: {
        pattern:
          '(cat|less|more|head|tail|vim|nano|vi|emacs|code).*(Cookies|Login Data|Web Data).*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading GCP credentials may leak cloud service account keys',
    match: {
      command: {
        pattern: '(cat|less|more|head|tail|vim|nano|vi|emacs|code).*/\\.config/gcloud/.*\\.json.*',
        type: 'regex',
      },
    },
  },
  {
    description: 'Reading GCP credentials may leak cloud service account keys',
    match: {
      path: {
        pattern: '.*/\\.config/gcloud/.*\\.json$',
        type: 'regex',
      },
    },
  },
];
