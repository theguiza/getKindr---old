import prisma from "@/lib/prisma";
import { user } from "@nextui-org/theme";
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

/**
 * This router will register and delete nfc tags in the db
 * @param {Request} request - The incoming request
 * 
 * @returns {Response} - The response to the incoming request
 * @endpoint POST /api/nfc
 */
export async function POST(request: NextRequest) {
    // Get the token from the request.
    const token = await getToken({ req: request });

    // If the token is missing, return an error response.
    if (!token) {
        return new Response("No valid session found", {
            status: 401,
        });
    } else if (token.accountType == "ORGANIZATION") {
        // If the account is an organization, register the tag
        let createdTag;

        // Try to register tag.
        try {
            // Get all the tag info from the request
            const {
                toDelete,
                serialNumber,
                text,
                location
            } = await request.json();
            // Get the organization ID from the token.
            const organization_id = token.organizationID ? token.organizationID as string : null;



            // If any of the required fields are missing, return an error response.
            if (!toDelete) {
                if (
                    !text ||
                    !serialNumber ||
                    !location
                    // !organization_id
                ) {
                    return new Response("Missing required fields", {
                        status: 400,
                    });
                }
            }


            // Create a new tag object with the new tag info passed from the request.
            const newTag = {

                serialNumber,
                // userId,
                location,
                text

            };


            // Check if the serial number already exists in the database
            const existingTag = await prisma.nFCTag.findUnique({
                where: {
                    serialNumber: serialNumber,
                },
            });
            if (existingTag && toDelete) {
                //if toDelete is true we delete the tag and return 200
                await prisma.nFCTag.delete({
                    where: {
                        serialNumber: serialNumber,
                    },
                });
                return new Response(JSON.stringify(createdTag), {
                    status: 200,
                });
            }
            if (existingTag) {
                // normally we return a 400 if the tag already exists
                return new Response("some words", { status: 400 });
            }


            // Add the new tag to the database
            createdTag = await prisma.nFCTag.create({
                data: newTag,
            });
        } catch (error) {
            // If there is an error creating the tag record, return an error response.
            console.log("error" + error);
            return new Response("Error adding events: " + error, {
                status: 500,
            });
        }

        // Return the created tag,
        return new Response(JSON.stringify(createdTag), {
            status: 200,
        });
    } else {
        // If the account is not an organization, return an error response.
        return new Response("Account is not an organization!", {
            status: 401,
        });
    }
}
