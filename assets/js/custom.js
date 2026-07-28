/* Oluntir website helpers. Copyright (c) 2026 Sebastian Lenth. MIT. */
(function(){'use strict';
function ready(fn){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);}else{fn();}}
ready(function(){
  document.querySelectorAll('[data-oluntir-current-year]').forEach(function(el){el.textContent=String(new Date().getFullYear());});
  document.querySelectorAll('.header').forEach(function(el){if(el.hasAttribute('data-sticky'))el.classList.add('is-sticky');});
  var top=document.querySelector('.back-to-top');
  if(top){window.addEventListener('scroll',function(){top.classList.toggle('is-visible',window.scrollY>400);},{passive:true});top.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});}
  if(window.jQuery){var $=window.jQuery;
    if($.fn.magnificPopup){$('.popup-gallery').magnificPopup({delegate:'a.portfolio-img',type:'image',gallery:{enabled:true,navigateByImgClick:true,preload:[0,1]}});}
    if($.fn.owlCarousel){$('.owl-carousel').each(function(){if(!$(this).hasClass('owl-loaded'))$(this).owlCarousel({items:1,loop:true,nav:true,dots:true});});}
    if($.fn.countTo){$('[data-to]').each(function(){$(this).countTo();});}
  }
  if(window.Swiper){document.querySelectorAll('.swiper-container').forEach(function(el){if(!el.swiper)new window.Swiper(el,{loop:true,pagination:{el:el.querySelector('.swiper-pagination'),clickable:true},navigation:{nextEl:el.querySelector('.swiper-button-next'),prevEl:el.querySelector('.swiper-button-prev')}});});}
});
})();
