import "../styles/globals.css";
import Layout from "../layout/default";
import { Provider } from "react-redux";
import Store from "../store/store";
import "@rainbow-me/rainbowkit/styles.css";
import {
	getDefaultConfig,
	RainbowKitProvider,
	lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
	sepolia,
	optimismSepolia,
	baseSepolia,
	arbitrumSepolia,
	unichainSepolia,
	soneiumMinato,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
	appName: "My RainbowKit App",
	projectId: "0e50ad124798913a4af212355f956d06",
	chains: [
		sepolia,
		optimismSepolia,
		baseSepolia,
		arbitrumSepolia,
		unichainSepolia,
		soneiumMinato,
	],
	ssr: true,
});

function MyApp({ Component, pageProps }) {
	const queryClient = new QueryClient();
	return (
		<Provider store={Store}>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider
						theme={lightTheme({
							accentColor: "#00bcd4",
							accentColorForeground: "white",
							borderRadius: "large",
						})}
						coolMode={true}
					>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</RainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</Provider>
	);
}

export default MyApp;
