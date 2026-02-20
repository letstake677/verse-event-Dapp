import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, arbitrum } from '@reown/appkit/networks';

// 1. Get projectId
export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56812d311ad59f7851f90ee44052b8f';

if (!projectId) {
  console.error('VITE_PROJECT_ID is not defined');
}

// 2. Set networks
const networks: [any, ...any[]] = [mainnet, arbitrum];

// 3. Create a metadata object - optional
const metadata = {
  name: 'Verse Event',
  description: 'Community-driven event platform',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// 4. Create the AppKit instance
export const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: false
  }
});
