const InputCheck = document.querySelector('#modo__noturno');
const elemento = document.querySelector('body');

const img_genova_navbar = document.querySelector('.imagem__genova__navbar');
const imagem_genova = document.querySelector('.imagem__genova');
const img_card_cerebro = document.querySelector('.imagem__card__cerebro');
const img_card_cerebro2 = document.querySelector('.imagem__card__cerebro2');
const img_card_bot = document.querySelector('.imagem__card__bot');
const titulo = document.querySelector('.titulo__menu__navbar');
const titulo__slide__tablet = document.querySelector('.titulo__slide2__tablet');
const paragrafo__slide__tablet = document.querySelector('.paragrafo__slide2__tablet');

if (InputCheck) {
  InputCheck.addEventListener('click', () => {
    const modo = InputCheck.checked ? 'dark' : 'light';
    elemento.setAttribute('data-bs-theme', modo);

    if (modo === 'dark') {
      if (imagem_genova) imagem_genova.src = '../assets/genova_branco.svg';
      if (img_card_cerebro) img_card_cerebro.src = '../assets/cerebro_branco.svg';
      if (img_card_cerebro2) img_card_cerebro2.src = '../assets/cerebro2_branco.svg';
      if (img_card_bot) img_card_bot.src = '../assets/bot_branco.svg';
      if (img_genova_navbar) img_genova_navbar.src = '../assets/genova_branco.svg';
      if (titulo) titulo.style.color = 'white';
      if (titulo__slide__tablet) titulo__slide__tablet.style.color = 'white';
      if (paragrafo__slide__tablet) paragrafo__slide__tablet.style.color = 'white';
    } else {
      if (imagem_genova) imagem_genova.src = '../assets/genova.svg';
      if (img_card_cerebro) img_card_cerebro.src = '../assets/cerebro.svg';
      if (img_card_cerebro2) img_card_cerebro2.src = '../assets/cerebro2.svg';
      if (img_card_bot) img_card_bot.src = '../assets/bot.svg';
      if (img_genova_navbar) img_genova_navbar.src = '../assets/genova.svg';
      if (titulo) titulo.style.color = 'black';
      if (titulo__slide__tablet) titulo__slide__tablet.style.color = 'black';
      if (paragrafo__slide__tablet) paragrafo__slide__tablet.style.color = 'black';
    }
  });
}
