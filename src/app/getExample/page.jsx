async function getMessFromApi(params) {
    try {
        const res = await fetch(`${process.env.NEXT_URL}/api/hello`, { cache: 'no-store' });
        return res.json();
    } catch {
        return { message: 'API example is available when the Next server is running.' };
    }
}

const GetExample = async () => {
    const { message } = await getMessFromApi()
    return (
        <section>
            <h2 className="txt">Get req</h2>
            {message && <p>{message}</p>}
        </section>
    )
}

export default GetExample
