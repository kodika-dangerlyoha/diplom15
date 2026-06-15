import Link from "next/link";

const Navigation = () => {
    return (
        <nav>
            <h2 className="txt">Навгиция</h2>
            <Link className="txt" href="/">Main</Link>
            <Link className="txt" href="/about">About</Link>
            <Link className="txt" href="/contacts">Contacts</Link>
            <Link className="txt" href="/users">Users</Link>
            <Link className="txt" href="/getExample">GE</Link>
        </nav>
    );
}

export default Navigation;