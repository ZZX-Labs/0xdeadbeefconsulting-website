'use strict';

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
    const loaded=new Set();

    while(true){
        const includes=[...root.querySelectorAll('[data-include]')].filter(element=>{
            const url=element.dataset.include;
            return url&&!loaded.has(element);
        });

        if(!includes.length) break;

        await Promise.all(includes.map(async element=>{
            const url=element.dataset.include;

            loaded.add(element);

            try{
                const response=await fetch(url,{
                    cache:'no-cache',
                    credentials:'same-origin',
                    headers:{
                        Accept:'text/html'
                    }
                });

                if(!response.ok){
                    throw new Error(`${response.status} ${response.statusText}`);
                }

                element.innerHTML=await response.text();
                element.removeAttribute('data-include');
                element.setAttribute('data-include-loaded',url);
            }catch(error){
                console.error(`Failed to load partial: ${url}`,error);

                element.innerHTML=`
                    <div class="notice notice-danger">
                        Unable to load site component:
                        <code>${escapeHTML(url)}</code>
                    </div>
                `;

                element.removeAttribute('data-include');
                element.setAttribute('data-include-error',url);
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

            const mobile=window.matchMedia('(max-width:900px)').matches;

            if(mobile){
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

        const clickedInsideNav=navLinks.contains(event.target);
        const clickedToggle=menuToggle.contains(event.target);

        if(navLinks.classList.contains('open')&&!clickedInsideNav&&!clickedToggle){
            closeNavigation(menuToggle,navLinks);
        }

        if(!clickedInsideNav){
            closeDropdowns();
        }
    });

    document.addEventListener('keydown',event=>{
        if(event.key!=='Escape') return;

        closeNavigation(menuToggle,navLinks);
        closeDropdowns();

        if(menuToggle){
            menuToggle.focus();
        }
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

        if(!href||
           href.startsWith('#')||
           href.startsWith('mailto:')||
           href.startsWith('tel:')||
           href.startsWith('javascript:')){
            return;
        }

        let linkPath;

        try{
            const url=new URL(href,window.location.origin);

            if(url.origin!==window.location.origin) return;

            linkPath=normalizePath(url.pathname);
        }catch{
            return;
        }

        const exactMatch=linkPath===currentPath;
        const sectionMatch=
            linkPath!=='/'&&
            currentPath.startsWith(linkPath);

        if(!exactMatch&&!sectionMatch) return;

        link.classList.add('active');
        link.setAttribute('aria-current',exactMatch?'page':'true');

        const parentDropdown=link.closest('.submenu');

        if(parentDropdown){
            const parentLink=parentDropdown.querySelector(':scope > a');

            if(parentLink){
                parentLink.classList.add('active');
            }
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

            if(!target.hasAttribute('tabindex')){
                target.setAttribute('tabindex','-1');
            }

            target.focus({
                preventScroll:true
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

function escapeHTML(value){
    return String(value)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#039;');
}
