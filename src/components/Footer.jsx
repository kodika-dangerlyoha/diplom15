const Footer = () => {
    return (
        <footer className="footer">
            <div className="inner inner_footer">
                <div className="footer__head">
                    <div className="footer__head__left">
                        <div className="footer__head__logo">
                            <img src="/img/logos/+WStore.svg" alt="+W Store" />
                        </div>
                        <nav className="footer__head__nav">
                            <a className="txt" href="#faq">Частые вопросы</a>
                            <a className="txt" href="#privacy">Политика обработки персональных данных</a>
                            <a className="txt" href="#help">Помощь</a>
                        </nav>
                    </div>
                    <button className="txt flex-center" type="button">Как купить игру?</button>
                </div>
                <div className="footer__separator"></div>
                <div className="footer__body">
                    <div className="footer__body__links">
                        <div className="footer__body__links__contacts">
                            <div className="footer__body__links__title">
                                <h4 className="txt">Контакты</h4>
                            </div>
                            <div className="footer__body__links__container">
                                <a href="#chat" className="txt">
                                    <img src="/img/icons/social/chat.svg" alt="" />
                                    <span>Онлайн чат</span>
                                </a>
                                <a href="mailto:bogatstvo@mail.ru" className="txt">
                                    <img src="/img/icons/social/mail.svg" alt="" />
                                    <span>bogatstvo@mail.ru</span>
                                </a>
                                <a href="https://vk.com/" className="txt" target="_blank" rel="noreferrer">
                                    <img src="/img/icons/social/vk.png" alt="" />
                                    <span>Вконтакте</span>
                                </a>
                            </div>
                        </div>
                        <div className="footer__body__links__social">
                            <div className="footer__body__links__title">
                                <h4 className="txt">Социальные сети</h4>
                            </div>
                            <div className="footer__body__links__container">
                                <a href="https://t.me/" title="tg" target="_blank" rel="noreferrer">
                                    <img src="/img/icons/social/tg.svg" alt="" />
                                </a>
                                <a href="https://vk.com/" title="vk" target="_blank" rel="noreferrer">
                                    <img src="/img/icons/social/vk.png" alt="" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="footer__separator"></div>
                    <div className="footer__body__info">
                        <div className="footer__body__info__copyright txt">
                            © 2025 Все права защищены. Фирма ООО «Бнал»
                            <br />Ставки на спорт в букмекерской компании «Чунгачхук»
                        </div>
                        <div className="footer__body__info__banks">
                            <img src="/img/icons/banks/all.svg" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;
