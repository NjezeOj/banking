'use server';

import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { createAdminClient, createSessionClient } from "../appwrite";
import { parseStringify } from "../utils";


export const signIn = async ({email, password}: signInProps) => {
    try {
        const { account } = await createAdminClient();

        const response = await account.createEmailPasswordSession(email, password);
        return parseStringify(response);
    } catch (error) {
        console.error(error)
    }
}

export const signUp = async (userData: SignUpParams) => {
    try {
        // Create a user account
        const { account } = await createAdminClient();

        const newUserAccount = await account.create(ID.unique(), userData.email, userData.password, `${userData.firstName} ${userData.lastName}`);
        const session = await account.createEmailPasswordSession(userData.email, userData.password);

        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify(newUserAccount); 
        // in next you can't pass large objects through server actiosn, 
        // they have to be stringified

    } catch (error) {
        console.error(error)
    }
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        return parseStringify(user)
    } catch (error) {
        return null;
    }
}

export const logoutAccount = async() => {
    try {
        const {account} = await createSessionClient();

        (await cookies()).delete('appwrite-session');

        await account.deleteSession('current')
    } catch (error) {
        return null;
    }
}
  