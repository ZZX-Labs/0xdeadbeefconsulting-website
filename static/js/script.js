'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle=document.querySelector('.menu-toggle');
    const navLinks=document.querySelector('.nav-links');

    if(menuToggle&&navLinks){
        menuToggle.setAttribute('aria-expanded','false');

        menuToggle.addEventListener('click',()=>{
            const open=navLinks.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded',open);
            document.body.classList.toggle('menu-open',open);
        });
    }

    document.querySelectorAll('.dropdown-toggle').forEach(toggle=>{
        toggle.addEventListener('click',e=>{
            e.preventDefault();
            const parent=toggle.closest('li');
            if(parent) parent.classList.toggle('open');
        });
    });

    document.addEventListener('click',e=>{
        if(!menuToggle||!navLinks) return;

        if(navLinks.classList.contains('open') &&
           !navLinks.contains(e.target) &&
           !menuToggle.contains(e.target)){
            navLinks.classList.remove('open');
            menuToggle.setAttribute('aria-expanded','false');
            document.body.classList.remove('menu-open');
        }
    });

    document.addEventListener('keydown',e=>{
        if(e.key!=='Escape') return;

        navLinks?.classList.remove('open');
        menuToggle?.setAttribute('aria-expanded','false');
        document.body.classList.remove('menu-open');

        document.querySelectorAll('li.open').forEach(li=>{
            li.classList.remove('open');
        });
    });

    const current=location.pathname.replace(/\/$/,'').split('/').pop();

    document.querySelectorAll('.nav-links a').forEach(link=>{
        const href=link.getAttribute('href');
        if(!href) return;

        const page=href.replace(/\/$/,'').split('/').pop();
        if(page===current) link.classList.add('active');
    });

    const header=document.querySelector('header');

    if(header){
        window.addEventListener('scroll',()=>{
            header.classList.toggle('scrolled',window.scrollY>20);
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
        anchor.addEventListener('click',e=>{
            const target=document.querySelector(anchor.getAttribute('href'));
            if(!target) return;

            e.preventDefault();
            target.scrollIntoView({behavior:'smooth',block:'start'});
        });
    });

    document.querySelectorAll('.current-year').forEach(el=>{
        el.textContent=new Date().getFullYear();
    });
});
