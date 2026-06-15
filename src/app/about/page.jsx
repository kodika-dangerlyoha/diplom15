import Image from "next/image";

const AboutPage = () => {
    return (
        <section className="content">
            <h2 className="txt">About</h2>
            <img src="./banners/11.jpg" alt="" />
            <Image src="/banners/11.jpg" alt="abnner" width="400" height="200" priority />
            <Image src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/236390/cab234fd4c0ae2f049e34e7bcb2393679b02bf91/header.jpg" alt="abnner" width="400" height="200" priority />
        </section>
    );
}

export default AboutPage;