export type User = {
	id: number;
	name: string;
};

export const PORT = 9898;

export const USERS: User[] = [
	{ id: 1, name: 'John Doe' },
	{ id: 2, name: 'Jane Doe' },
];

export class FakeRemoteService {
	public getUsers(): User[] {
		return USERS;
	}

	public getUser(id: number): User {
		const user = USERS.find((user) => user.id === id);
		if (!user) throw new Error('User not found');
		return user;
	}

	public createUser(user: User): User {
		return user;
	}

	public updateUser(user: User): User {
		if (this.getUser(user.id)) {
			return user;
		}

		throw new Error('User not found');
	}

	public deleteUser(id: number): void {
		const user = this.getUser(id);

		if (!user) {
			throw new Error('User not found');
		}
	}
}
