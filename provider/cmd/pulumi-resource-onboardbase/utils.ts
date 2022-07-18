import * as CryptoJS from "crypto-js";
import axios from "axios";

const instance = axios.create({
  baseURL: "https://api.onboardbase.com/graphql",
});

const decryptSecrets = (secret: string, encryptionPassphrase: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(secret.toString(), encryptionPassphrase);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error("Unable to decrypt secret. Your passcode might be invalid");
  }
};

export const aesDecryptSecret = async (secret: string, passcode: string) => {
  return decryptSecrets(secret, passcode);
};

export const fetchSecrets = async (
  api_key: string,
  project: string,
  environment: string
) => {
  const query = `query {
      generalPublicProjects(filterOptions: { title: "${project}", disableCustomSelect: true }) {
        list {
          id
          title
          publicEnvironments(filterOptions: { title: "${environment}" }) {
            list {
              id
              key
              title
            }
          }
        }
      }
    }`;

  const { data } = await instance.post(
    "",
    {
      query,
    },
    {
      headers: {
        KEY: api_key,
        "Content-Type": "application/json",
      },
    }
  );

  if (data.errors && data.errors[0].message === "Unauthorized") {
    throw new Error(
      "Unable to fetch secrets. You may not be authorized please check your API key"
    );
  }

  return data;
};

export default { aesDecryptSecret, fetchSecrets };
