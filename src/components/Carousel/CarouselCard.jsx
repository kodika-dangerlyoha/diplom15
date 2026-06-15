import { gameHref, toPublicAsset } from '@/lib/gameRoutes'

const CarouselCard = ({
	count,
	game_info,
	carousel_banner_list,
	toggle_game_basket = () => {},
	toggle_game_favorite = () => {},
}) => {
	const imageSrc = toPublicAsset(game_info.bigBanner || game_info.imgH)
	const mobileImageSrc = toPublicAsset(game_info.banner_vert || game_info.libraryCapsule || game_info.imgW || game_info.bigBanner)
	const href = gameHref(game_info)

    return (
        <article
            className="carousel__banner"
            data-game_id={game_info.id}
            order={count}
            game_id={game_info.id}
            style={{
                marginLeft: count === 0 ? '0' : undefined,
                zIndex: carousel_banner_list.length - count + 1,
                transform: `scale(${1 - count * 0.05})`,
                filter: `blur(${count}px)`
            }}
        >
            <div className="carousel__banner__imgBlock">
                {imageSrc ? (
					<img
						src={imageSrc}
						data-h={imageSrc}
						data-v={mobileImageSrc || imageSrc}
						alt=""
					/>
				) : null}
            </div>

            <a
                href={href}
                className="carousel__banner__link"
                style={{ display: count === 0 ? 'block' : 'none' }}
            />

            <div className="carousel__banner__interaction">
                <div className="carousel__banner__interaction__title txt">
                    {game_info.name}
                </div>

                <div className="carousel__banner__interaction__shopInfo">
                    <div className="carousel__banner__interaction__shopInfo__buttons">
                        <button
                            type="button"
                            data-button="basket"
                            data-game_id={game_info.id}
                            onClick={() => toggle_game_basket(game_info.id, game_info.name)}
                            className="carousel__banner__interaction__shopInfo__buttons__button"
                        >
                            <img src="img/icons/main/basket32.png" alt="" />
                        </button>

                        <button
                            type="button"
                            data-button="favorite"
                            data-game_id={game_info.id}
                            onClick={() => toggle_game_favorite(game_info.id, game_info.name)}
                            className="carousel__banner__interaction__shopInfo__buttons__button"
                        >
                            <img src="img/icons/main/heart32.png" alt="" />
                        </button>
                    </div>

                    <div className="carousel__banner__interaction__shopInfo__priceTag">
                        <div className="carousel__banner__interaction__shopInfo__priceTag__prices">
                            <div className="carousel__banner__interaction__shopInfo__priceTag__prices__oldPrice txt">
                                {game_info.oldPrice} ₽
                            </div>
                            <div className="carousel__banner__interaction__shopInfo__priceTag__prices__newPrice txt">
                                {game_info.newPrice} ₽
                            </div>
                        </div>
                        <div className="carousel__banner__interaction__shopInfo__priceTag__discount flex-center txt">
                            {Math.round((game_info.oldPrice - game_info.newPrice) / game_info.oldPrice * 100)}%
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default CarouselCard
