type User = {
  id: number;
  name: string;
}

export const PORT = 9898;

const initialUsers: User[] = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Doe' },
]

export class FakeRemoteService {
  private users: User[] = initialUsers
 
  public async getUsers(): Promise<User[]> {
    return this.users
  }

  public async getUser(id: number): Promise<User> {
    const user = this.users.find(user => user.id === id)
    if (!user) throw new Error('User not found')
    return user
  }

  public async createUser(user: User): Promise<User> {
    console.log(user);
    
    this.users.push(user)
    return user
  }

  public async updateUser(user: User): Promise<User> {
    const index = this.users.findIndex(u => u.id === user.id)
    if (index === -1) throw new Error('User not found')
    this.users[index] = user
    return user
  }

  public async deleteUser(id: number): Promise<void> {
    const index = this.users.findIndex(u => u.id === id)
    if (index === -1) throw new Error('User not found')
    this.users.splice(index, 1)
  }

  public async reset(): Promise<void> {
    this.users = initialUsers
  }
}
