"use server";

import { db } from "@/prisma/db";
import { UserProps } from "@/types/types";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function getUserClients(userId: string | undefined) {
  if (userId) {
    try {
      const users = await db.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          role: "CLIENT",
          userId,
        },
      });

      return users;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export async function createUser(data: UserProps) {
  const { email, password, firstName, lastName, name, phone, image, role } =
    data;
  try {
    // Hash the PAASWORD
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return {
        error: `Email already exists`,
        status: 409,
        data: null,
      };
    }
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name,
        phone,
        image,
        role,
      },
    });
    revalidatePath("/dashboard/clients");
    // console.log(newUser);
    return {
      error: null,
      status: 200,
      data: newUser,
    };
  } catch (error) {
    console.log(error);
    return {
      error: `Something Went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}
