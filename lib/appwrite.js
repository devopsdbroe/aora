import {
	Account,
	Avatars,
	Client,
	Databases,
	ID,
	Query,
} from "react-native-appwrite";

export const appwriteConfig = {
	endpoint: "https://cloud.appwrite.io/v1",
	platform: "com.react.aora",
	projectId: "67045da7003a6dbbf13c",
	databaseId: "67045ee0001c3bda8802",
	userCollectionId: "67045ef900183020ac8a",
	videoCollectionId: "67045f10001e9c4e5b60",
	storageId: "67045ff80032b123559f",
};

// Init your React Native SDK
const client = new Client();

client
	.setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
	.setProject(appwriteConfig.projectId) // Your project ID
	.setPlatform(appwriteConfig.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
	try {
		// Create new account using email, password, and username params
		const newAccount = await account.create(
			ID.unique(),
			email,
			password,
			username
		);

		// Throw error if account fails to create
		if (!newAccount) throw Error;

		// If creation is successful, generate avatar with username initials
		const avatarUrl = avatars.getInitials(username);

		await signIn(email, password);

		// Create new instance of user in Appwrite DB
		const newUser = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			ID.unique(),
			{
				accountId: newAccount.$id,
				email: email,
				username: username,
				avatar: avatarUrl,
			}
		);

		return newUser;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

export const signIn = async (email, password) => {
	try {
		// Try to establish new user session
		const session = await account.createEmailPasswordSession(email, password);

		return session;
	} catch (error) {
		throw new Error(error);
	}
};

export const getCurrentUser = async () => {
	try {
		// Check if user exists
		const currentAccount = await account.get();

		// Throw error if user not found
		if (!currentAccount) throw Error;

		// If found, specify DB and User collection
		// Followed by query checking accountId against DB
		const currentUser = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			[Query.equal("accountId", currentAccount.$id)]
		);

		// Throw error if user not found
		if (!currentUser) throw Error;

		// Return user
		return currentUser.documents[0];
	} catch (error) {
		console.log(error);
	}
};
