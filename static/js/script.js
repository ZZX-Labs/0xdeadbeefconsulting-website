'use strict';

const INCLUDES={
    header:'/partials/header.html',
    nav:'/partials/nav.html',
    footer:'/partials/footer.html'
};

document.addEventListener('DOMContentLoaded',async()=>{
    await loadIncludes();
    initializeNavigation();
    initializeActiveLinks();
    initializeHeaderScroll();
    initializeSmoothScroll();
    initializeCopyButtons();
    initializeCurrentYear();
});

async function loadIncludes(root=document){
    while(true){
        const elements=[...root.querySelectorAll('[include-data]')];

        if(!elements.length) break;

        await Promise.all(elements.map(async element=>{
            const name=element.getAttribute('include-data');
            const includeURL=INCLUDES[name];

            element.removeAttribute('include-data');

            if(!name||!includeURL){
                console.error(`Unknown include component: ${name||'(empty)'}`);
                element.setAttribute('include-error',name||'unknown');
                return;
            }

            try{
                const response=await fetch(includeURL,{
                    method:'GET',
                    cache:'no-store',
                    credentials:'same-origin',
                    headers:{
                        Accept:'text/html'
                    }
                });

                if(!response.ok){
                    throw new Error(
                        `${response.status} ${response.statusText}: ${includeURL}`
                    );
                }

                element.innerHTML=await response.text();
                element.setAttribute('include-loaded',name);
            }catch(error){
                console.error(`Unable to load include "${name}":`,error);
                element.setAttribute('include-error',name);
            }
        }));
    }
}

function initializeNavigation(){
    const menuToggle=document.querySelector('.menu-toggle');
    const navLinks=document.querySelector('.nav-links');

    if(menuToggle&&navLinks){
        menuToggle.setAttribute('aria-expanded','false');

        menuToggle.addEventListener('click',()=>{
            const open=navLinks.classList.toggle('open');

            menuToggle.setAttribute('aria-expanded',String(open));
            document.body.classList.toggle('menu-open',open);
        });
    }

    document.querySelectorAll('.dropdown-toggle').forEach(toggle=>{
        toggle.setAttribute('aria-expanded','false');

        toggle.addEventListener('click',event=>{
            const parent=toggle.closest('li');

            if(!parent) return;

            if(window.matchMedia('(max-width:900px)').matches){
                event.preventDefault();
            }

            const open=parent.classList.toggle('open');

            toggle.setAttribute('aria-expanded',String(open));

            document.querySelectorAll('.nav-links li.open').forEach(item=>{
                if(item===parent) return;

                item.classList.remove('open');

                const itemToggle=item.querySelector(':scope > .dropdown-toggle');

                if(itemToggle){
                    itemToggle.setAttribute('aria-expanded','false');
                }
            });
        });
    });

    document.addEventListener('click',event=>{
        if(!menuToggle||!navLinks) return;

        const insideNavigation=navLinks.contains(event.target);
        const insideToggle=menuToggle.contains(event.target);

        if(
            navLinks.classList.contains('open')&&
            !insideNavigation&&
            !insideToggle
        ){
            closeNavigation(menuToggle,navLinks);
        }

        if(!insideNavigation){
            closeDropdowns();
        }
    });

    document.addEventListener('keydown',event=>{
        if(event.key!=='Escape') return;

        closeNavigation(menuToggle,navLinks);
        closeDropdowns();
        menuToggle?.focus();
    });

    window.addEventListener('resize',()=>{
        if(window.matchMedia('(min-width:901px)').matches){
            closeNavigation(menuToggle,navLinks);
            closeDropdowns();
        }
    });
}

function closeNavigation(menuToggle,navLinks){
    navLinks?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
}

function closeDropdowns(){
    document.querySelectorAll('.nav-links li.open').forEach(item=>{
        item.classList.remove('open');

        const toggle=item.querySelector(':scope > .dropdown-toggle');

        if(toggle){
            toggle.setAttribute('aria-expanded','false');
        }
    });
}

function initializeActiveLinks(){
    const currentPath=normalizePath(window.location.pathname);

    document.querySelectorAll('.nav-links a[href]').forEach(link=>{
        const href=link.getAttribute('href');

        if(
            !href||
            href.startsWith('#')||
            href.startsWith('mailto:')||
            href.startsWith('tel:')||
            href.startsWith('javascript:')
        ){
            return;
        }

        let url;

        try{
            url=new URL(href,window.location.origin);
        }catch{
            return;
        }

        if(url.origin!==window.location.origin) return;

        const linkPath=normalizePath(url.pathname);
        const exactMatch=linkPath===currentPath;
        const sectionMatch=
            linkPath!=='/'&&
            currentPath.startsWith(linkPath);

        if(!exactMatch&&!sectionMatch) return;

        link.classList.add('active');

        if(exactMatch){
            link.setAttribute('aria-current','page');
        }

        const submenu=link.closest('.submenu');

        if(submenu){
            submenu
                .querySelector(':scope > a')
                ?.classList.add('active');
        }
    });
}

function initializeHeaderScroll(){
    const header=document.querySelector('header');

    if(!header) return;

    const updateHeader=()=>{
        header.classList.toggle('scrolled',window.scrollY>20);
    };

    updateHeader();

    window.addEventListener('scroll',updateHeader,{
        passive:true
    });
}

function initializeSmoothScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
        anchor.addEventListener('click',event=>{
            const href=anchor.getAttribute('href');

            if(!href||href==='#') return;

            let target;

            try{
                target=document.querySelector(href);
            }catch{
                return;
            }

            if(!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior:'smooth',
                block:'start'
            });

            history.pushState(null,'',href);
        });
    });
}

function initializeCopyButtons(){
    document.querySelectorAll('[data-copy]').forEach(button=>{
        button.addEventListener('click',async()=>{
            const selector=button.dataset.copy;

            if(!selector) return;

            let source;

            try{
                source=document.querySelector(selector);
            }catch{
                return;
            }

            if(!source) return;

            const value=(
                source.value||
                source.textContent||
                ''
            ).trim();

            if(!value) return;

            const originalText=button.textContent;

            try{
                await navigator.clipboard.writeText(value);

                button.textContent='Copied';
                button.classList.add('copied');

                window.setTimeout(()=>{
                    button.textContent=originalText;
                    button.classList.remove('copied');
                },1500);
            }catch(error){
                console.error('Unable to copy value:',error);

                button.textContent='Copy failed';

                window.setTimeout(()=>{
                    button.textContent=originalText;
                },1500);
            }
        });
    });
}

function initializeCurrentYear(){
    const year=String(new Date().getFullYear());

    document.querySelectorAll('.current-year').forEach(element=>{
        element.textContent=year;
    });
}

function normalizePath(path){
    if(!path) return '/';

    let normalized=path
        .replace(/\/index\.html$/i,'/')
        .replace(/\/+/g,'/');

    if(!normalized.startsWith('/')){
        normalized=`/${normalized}`;
    }

    if(normalized.length>1&&!normalized.endsWith('/')){
        normalized=`${normalized}/`;
    }

    return normalized;
}
