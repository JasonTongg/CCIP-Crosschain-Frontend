import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang='en'>
			<Head>
				<meta charset='UTF-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />

				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' crossorigin />
				<link
					href='https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;1,300&family=Ubuntu:wght@300&display=swap'
					rel='stylesheet'
				/>
				<link rel='icon' href='./assets/logo.png' />
				<title>CCIP Rebase Token</title>

				<meta name='title' content='CCIP Rebase Token' />
				<meta name='description' content='CCIP Cross Chain Rebase Token' />
				<meta property='og:title' content='CCIP Rebase Token' />
				<meta
					property='og:description'
					content='CCIP Cross Chain Rebase Token'
				/>
				<meta property='twitter:title' content='CCIP Rebase Token' />
				<meta
					property='twitter:description'
					content='CCIP Cross Chain Rebase Token'
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
