'use server';

import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export const getAuthCallback = async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id || !user.email) {
        throw new Error('User not found');
    }

    const existingUser = await db.user.findUnique({
        where: { id: user.id }
    });

    if (!existingUser) {
        await db.user.create({
            data: {
                id: user.id,
                email: user.email,
            }
        });
    }

    return { success: true }
}
