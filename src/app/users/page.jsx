import Link from "next/link";
import { notFound } from "next/navigation";

async function getUsers() {
    const res = await fetch('https://jsonplaceholder.typicode.com/users', {
        cache: 'no-store',
    });
    if (res.status === 404) notFound();
    if (!res.ok) throw new Error('failed fetch users');
    return res.json();
}

const UserItem = ({ user }) => {
    return (
        <Link href={`/users/${user.id}`} key={user.id}>
            {user.name}
        </Link>
    )
}

const UsersPage = async () => {
    const users = await getUsers();

    return (
        <section>
            <h2 className="txt">Users</h2>
            {users.map(user => <UserItem key={user.id} user={user} />)}
        </section>
    );
}

export default UsersPage;
