async function getUser(id) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('failed fetch user');
    return res.json();
}

const UserPage = async ({ params }) => {
    const prm = await params;
    const user = await getUser(prm.id);

    return (
        <div>
            <h1 className="txt">User #{user.id}</h1>
            <div className="txt">{user.name}</div>
            <div className="txt">{user.userName}</div>
        </div>
    );
}

export default UserPage;