(function(){
  "use strict";

  var app = document.getElementById("app");
  var noise = document.getElementById("noise");
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");

  /* ═══ ROULE ═══ */
  var routes = {
    "home": renderHome,
    "shows": renderShows,
    "store": renderStore,
    "team": renderTeam
  };

  // Сохранение позиции скролла
  var scrollPositions = {};

  function route(){
    var hash = location.hash.slice(1) || "home";
    var fn = routes[hash];
    if(!fn) fn = routes.home;

    // Сохраняем текущую позицию
    scrollPositions[currentHash || "home"] = window.scrollY;

    // Fade out
    app.style.opacity = "0";
    app.style.transform = "translateY(10px)";
    app.style.transition = "opacity .2s ease, transform .2s ease";

    setTimeout(function(){
      app.innerHTML = "";
      app.style.animation = "none";
      app.offsetHeight;
      app.style.animation = "";
      fn();

      // Восстанавливаем позицию или скроллим наверх
      var savedPos = scrollPositions[hash];
      if(savedPos !== undefined){
        window.scrollTo(0, savedPos);
      } else {
        window.scrollTo({top:0, behavior:"smooth"});
      }

      // Fade in
      app.style.opacity = "1";
      app.style.transform = "translateY(0)";

      // Обновляем активную ссылку
      updateActiveLink(hash);

      currentHash = hash;
    }, 200);

    closeNav();
  }

  var currentHash = "home";

  // Индикатор текущего раздела
  function updateActiveLink(hash){
    document.querySelectorAll('nav .links a').forEach(function(a){
      var linkHash = a.getAttribute("href").slice(1);
      if(linkHash === hash){
        a.classList.add("active");
        a.style.color = "var(--neon2)";
        a.style.textShadow = "0 0 8px var(--neon2)";
      } else {
        a.classList.remove("active");
        a.style.color = "";
        a.style.textShadow = "";
      }
    });
  }

  window.addEventListener("hashchange", route);
  window.addEventListener("load", route);

  /* ═══ BURGER ═══ */
  burger.addEventListener("click", function(){
    navLinks.classList.toggle("open");
  });

  function closeNav(){
    navLinks.classList.remove("open");
  }

  navLinks.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", closeNav);
  });

  /* ═══ NOISE TOGGLE ═══ */
  document.getElementById("toggle-noise").addEventListener("click", function(){
    noise.classList.toggle("hidden");
    this.textContent = noise.classList.contains("hidden") ? "⊕" : "⊘";
  });

  /* ═══ КАСТОМНЫЙ КУРСОР ═══ */
  (function initCursor(){
    if(window.innerWidth <= 768) return;

    var dot = document.createElement("div");
    dot.id = "cursor-dot";
    document.body.appendChild(dot);

    var ring = document.createElement("div");
    ring.id = "cursor-ring";
    document.body.appendChild(ring);

    var mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener("mousemove", function(e){
      mx = e.clientX;
      my = e.clientY;
    });

    function animate(){
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(animate);
    }
    animate();

    var targets = "a,button,.show-card,.prod-card,.buy-now,.member,.filter-btn,.socials a,.f-links a,.modal-close,.video-thumb";
    document.addEventListener("mouseover", function(e){
      if(e.target.closest(targets)) document.body.classList.add("hovering");
    });
    document.addEventListener("mouseout", function(e){
      if(e.target.closest(targets)) document.body.classList.remove("hovering");
    });
  })();

  /* ═══ STARS ═══ */
  (function makeStars(){
    var c = document.createElement("div");
    c.id = "stars";
    for(var i=0;i<80;i++){
      var s = document.createElement("div");
      s.className = "star";
      s.style.left = Math.random()*100+"%";
      s.style.top = Math.random()*100+"%";
      s.style.setProperty("--d", (Math.random()*4+2)+"s");
      s.style.animationDelay = Math.random()*5+"s";
      var sz = (Math.random()*2+1)+"px";
      s.style.width = sz;
      s.style.height = sz;
      c.appendChild(s);
    }
    document.body.appendChild(c);
  })();

  /* ═══ ВИДЕО ПЛЕЕР — lazy init ═══ */
  var modal, iframe, thumb, vTitle, vCat, vDesc;
  var modalReady = false;

  function createVideoModal(){
    var html = '<div id="videoModal" class="modal">' +
      '<div class="modal-body">' +
        '<button class="modal-close" aria-label="Закрыть">&times;</button>' +
        '<div class="video-title">' +
          '<h2 id="vTitle"></h2>' +
          '<div class="video-meta"><span class="v-cat" id="vCat"></span></div>' +
        '</div>' +
        '<div class="video-wrap">' +
          '<div class="video-thumb" id="videoThumb"><div class="play-icon"></div></div>' +
          '<iframe id="modalVideo" src="" frameborder="0" allowfullscreen allow="autoplay"></iframe>' +
        '</div>' +
        '<p id="vDesc" class="video-desc"></p>' +
      '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    modal = document.getElementById("videoModal");
    iframe = document.getElementById("modalVideo");
    thumb = document.getElementById("videoThumb");
    vTitle = document.getElementById("vTitle");
    vCat = document.getElementById("vCat");
    vDesc = document.getElementById("vDesc");
    modalReady = true;

    modal.querySelector(".modal-close").addEventListener("click", closeVideo);
    modal.addEventListener("click", function(e){
      if(e.target === modal) closeVideo();
    });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && modal.style.display === "flex") closeVideo();
    });
  }

  function openVideo(id, title, desc, cat){
    if(!modalReady) createVideoModal();

    var label = DATA.catLabels[cat] || cat;
    vTitle.textContent = title || "";
    vCat.textContent = label;
    vDesc.textContent = desc || "";
    thumb.style.backgroundImage = "url(https://img.youtube.com/vi/"+id+"/maxresdefault.jpg)";
    thumb.classList.remove("hidden");
    iframe.src = "";
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    thumb.onclick = function(){
      thumb.classList.add("hidden");
      iframe.src = "https://www.youtube.com/embed/"+id+"?autoplay=1&rel=0";
      thumb.onclick = null;
    };
  }

  function closeVideo(){
    if(!modalReady) return;
    modal.style.display = "none";
    iframe.src = "";
    thumb.classList.remove("hidden");
    thumb.onclick = null;
    document.body.style.overflow = "";
  }

  /* ═══ МОДАЛКА ТОВАРА — lazy init ═══ */
  var pModal, pZoomImg, pZoomTitle, pZoomDesc;
  var productModalReady = false;

  function createProductModal(){
    var html = '<div id="productModal" class="modal">' +
      '<div class="modal-body product-modal-body">' +
        '<button class="modal-close" id="closeProduct">&times;</button>' +
        '<div class="product-zoom"><img id="zoomImg" src="" alt=""></div>' +
        '<div class="product-modal-info">' +
          '<h2 id="zoomTitle"></h2>' +
          '<p id="zoomDesc"></p>' +
          '<button class="buy-now" id="zoomBuy">заказать</button>' +
        '</div>' +
      '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    pModal = document.getElementById("productModal");
    pZoomImg = document.getElementById("zoomImg");
    pZoomTitle = document.getElementById("zoomTitle");
    pZoomDesc = document.getElementById("zoomDesc");
    productModalReady = true;

    document.getElementById("closeProduct").addEventListener("click", closeProduct);
    pModal.addEventListener("click", function(e){
      if(e.target === pModal) closeProduct();
    });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && pModal.style.display === "flex") closeProduct();
    });

    document.getElementById("zoomBuy").addEventListener("click", function(){
      var idx = null;
      DATA.products.forEach(function(p, i){
        if(p.title === pZoomTitle.textContent) idx = i;
      });
      closeProduct();
      setTimeout(function(){ if(idx !== null) openForm(DATA.products[idx].title); }, 350);
    });
  }

  function openProductModal(idx){
    if(!productModalReady) createProductModal();
    var p = DATA.products[idx];
    if(!p) return;
    pZoomImg.src = p.img;
    pZoomImg.alt = p.title;
    pZoomTitle.textContent = p.title;
    pZoomDesc.textContent = p.desc;
    pModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeProduct(){
    if(!productModalReady) return;
    pModal.style.display = "none";
    pZoomImg.src = "";
    document.body.style.overflow = "";
  }

  /* ═══ SCROLL TO TOP ═══ */
  var scrollTopBtn = document.getElementById("scrollTop");
  window.addEventListener("scroll", function(){
    if(window.scrollY > 400){
      scrollTopBtn.style.display = "block";
    } else {
      scrollTopBtn.style.display = "none";
    }
  });
  scrollTopBtn.addEventListener("click", function(){
    window.scrollTo({top:0, behavior:"smooth"});
  });

  /* ═══════════════════════════
     PAGES
     ═══════════════════════════ */

  /* — HOME — */
  function renderHome(){
    var h = "";

    h += '<div class="hero">';
    h += '<h1 data-text="Телеканал Новый">Телеканал Новый</h1>';
    h += '<p>самый честный телеканал интернета</p>';
    h += '</div>';

    h += ticker();

    h += '<section class="section">';
    h += '<h2>О канале</h2>';
    h += '<p style="color:var(--muted);line-height:1.7">';
    h += 'Телеканал Новый — это лучший канал на телевидении, созданный двумя энтузиастами. ';
    h += 'Вещаем с 634 канала из Ростова-на-Дону. Репортёр Кирилл Новиков и оператор Мефодий Стариков ';
    h += 'творят магию абсурда. Виктор Курча — легенда Луганска — показывает методы ремонта.';
    h += '</p></section>';

    h += '<section class="section">';
    h += '<h2>Передачи</h2><ul style="color:var(--muted)">';
    h += '<li>Научные эксперименты и изобретения</li>';
    h += '<li>Лайфхаки на выживание</li>';
    h += '<li>Кухонный Беспредел</li>';
    h += '<li>Хозяйский Сабатон</li>';
    h += '</ul>';
    h += '<a href="#shows" class="buy-btn" style="margin-top:1rem;display:inline-block">все передачи →</a>';
    h += '</section>';

    h += '<section class="section">';
    h += '<h2>Магазин</h2>';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:1rem">';
    DATA.products.slice(0,4).forEach(function(p){
      h += '<div style="background:var(--surface);border:1px solid rgba(255,255,255,.06);border-radius:8px;overflow:hidden">';
      h += '<img src="'+p.img+'" alt="'+p.title+'" style="width:100%;height:100px;object-fit:contain;background:#111" loading="lazy">';
      h += '<div style="padding:.6rem"><p style="color:var(--neon2);font-size:.75rem;margin-bottom:.3rem">'+p.title+'</p></div></div>';
    });
    h += '</div>';
    h += '<a href="#store" style="display:inline-block;margin-top:1rem;padding:.6rem 1.5rem;background:linear-gradient(135deg,var(--neon2),var(--neon1));color:#000;font-weight:700;border-radius:6px;font-size:.85rem">в магазин →</a>';
    h += '</section>';

    app.innerHTML = h;
  }

  /* — SHOWS — */
  function renderShows(){
    var h = '<div class="section">';
    h += '<h2>Все передачи</h2>';

    // filters
    h += '<div class="filters">';
    h += '<button class="active" data-f="all">все</button>';
    Object.keys(DATA.catLabels).forEach(function(c){
      h += '<button data-f="'+c+'">'+c+'</button>';
    });
    h += '</div>';

    h += '<div class="shows-grid" id="grid">';
    DATA.videos.forEach(function(v){
      var cat = DATA.catLabels[v.cat] || v.cat;
      h += '<div class="show-card" data-cat="'+v.cat+'" data-id="'+v.id+'" data-title="'+v.title+'" data-desc="'+v.desc+'">';
      h += '<div class="thumb">';
      h += '<img src="https://img.youtube.com/vi/'+v.id+'/hqdefault.jpg" alt="'+v.title+'" loading="lazy">';
      h += '<span class="badge cat">'+cat+'</span>';
      h += '</div>';
      h += '<div class="info"><h3>'+v.title+'</h3><p>'+v.desc+'</p></div>';
      h += '</div>';
    });
    h += '</div></div>';

    app.innerHTML = h;

    // filter logic
    document.querySelectorAll(".filters button").forEach(function(btn){
      btn.addEventListener("click", function(){
        document.querySelectorAll(".filters button").forEach(function(b){b.classList.remove("active")});
        btn.classList.add("active");
        var f = btn.getAttribute("data-f");
        document.querySelectorAll(".show-card").forEach(function(card){
          if(f==="all" || card.getAttribute("data-cat")===f){
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
    });

    // open video
    document.querySelectorAll(".show-card").forEach(function(card){
      card.addEventListener("click", function(){
        openVideo(
          card.getAttribute("data-id"),
          card.getAttribute("data-title"),
          card.getAttribute("data-desc"),
          card.getAttribute("data-cat")
        );
      });
    });
  }

  /* — STORE — */
  function renderStore(){
    var prods = DATA.products;

    var h = '<div class="section">';
    h += '<h2>Магазин</h2>';
    h += '<p style="color:var(--muted);margin-bottom:2rem;font-size:.9rem">Фирменный мерч Телеканала Новый. Лимитированная партия. Успей, пока не сожрали.</p>';

    h += '<div class="store-grid">';
    prods.forEach(function(p, i){
      h += '<div class="prod-card" data-idx="'+i+'" style="cursor:pointer">';
      h += '<div class="prod-img-wrap" data-zoom="'+i+'">';
      h += '<img src="'+p.img+'" alt="'+p.title+'" loading="lazy">';
      h += '</div>';
      h += '<div class="prod-info">';
      h += '<h3>'+p.title+'</h3>';
      h += '<p>'+p.desc+'</p>';
      h += '<div class="prod-bottom">';
      h += '<span class="prod-tag">limited</span>';
      h += '<button class="buy-now" data-idx="'+i+'">заказать</button>';
      h += '</div>';
      h += '</div>';
      h += '</div>';
    });
    h += '</div></div>';

    // Спонсорский блок
    h += '<div class="section">';
    h += '<h2>При поддержке</h2>';
    h += '<div class="sponsor-card">';
    h += '<img src="'+DATA.sponsor.img+'" alt="'+DATA.sponsor.name+'" loading="lazy">';
    h += '<div class="sponsor-info"><h3>'+DATA.sponsor.name+'</h3>';
    h += '<p>'+DATA.sponsor.desc+'</p></div></div></div>';

    app.innerHTML = h;

    // Click on image → zoom
    document.querySelectorAll('[data-zoom]').forEach(function(wrap){
      wrap.addEventListener("click", function(){
        var idx = parseInt(this.getAttribute("data-zoom"));
        openProductModal(idx);
      });
    });

    // Buy buttons
    document.querySelectorAll(".buy-now").forEach(function(btn){
      btn.addEventListener("click", function(){
        var idx = this.getAttribute("data-idx");
        openForm(prods[idx].title);
      });
    });
  }

  /* — FORM — */
  function openForm(productName){
    var overlay = document.createElement("div");
    overlay.className = "form-overlay open";
    var prodLabel = productName ? '<p class="form-prod">Товар: '+productName+'</p>' : '';
    overlay.innerHTML = '<div class="form-box">' +
      '<div class="form-header">' +
      '<div class="form-icon">📦</div>' +
      '<h3>оформить заказ</h3>' +
      '</div>' +
      prodLabel +
      '<input type="text" id="f-name" placeholder="как тебя зовут">' +
      '<input type="tel" id="f-phone" placeholder="телефон для связи">' +
      '<div class="btn-row">' +
      '<button class="cancel" id="f-cancel">✕</button>' +
      '<button class="submit" id="f-submit">отправить →</button>' +
      '</div></div>';
    document.body.appendChild(overlay);

    setTimeout(function(){ overlay.querySelector("#f-name").focus(); }, 150);

    overlay.querySelector("#f-cancel").addEventListener("click", function(){
      animateClose(overlay);
    });
    overlay.addEventListener("click", function(e){
      if(e.target===overlay) animateClose(overlay);
    });
    document.addEventListener("keydown", function esc(e){
      if(e.key==="Escape"){ animateClose(overlay); document.removeEventListener("keydown", esc); }
    });

    overlay.querySelector("#f-submit").addEventListener("click", function(){
      var name = document.getElementById("f-name").value.trim();
      var phone = document.getElementById("f-phone").value.trim();
      if(!name){ shakeInput(document.getElementById("f-name")); return; }
      if(!phone){ shakeInput(document.getElementById("f-phone")); return; }
      animateClose(overlay);
      setTimeout(function(){ thanks(); }, 300);
    });
  }

  function shakeInput(el){
    el.style.animation = "shake .4s ease";
    el.style.borderColor = "#f00";
    el.style.boxShadow = "0 0 10px rgba(255,0,0,.4)";
    setTimeout(function(){
      el.style.animation = "";
      el.style.borderColor = "";
      el.style.boxShadow = "";
    }, 500);
  }

  function animateClose(el){
    el.style.opacity = "0";
    el.style.transition = "opacity .25s ease";
    setTimeout(function(){ el.remove(); }, 250);
  }

  function thanks(){
    var overlay = document.createElement("div");
    overlay.className = "form-overlay open";
    overlay.innerHTML = '<div class="form-box thanks-box">' +
      '<div class="thanks-anim">' +
      '<div class="thanks-bird">🕊️</div>' +
      '<div class="thanks-ring"></div>' +
      '</div>' +
      '<h3>заказ принят</h3>' +
      '<p>Голуби уже в пути.<br>Ожидай весточку.</p>' +
      '<button class="submit thanks-btn" id="thanks-ok">хорошо</button>';
    document.body.appendChild(overlay);

    overlay.querySelector("#thanks-ok").addEventListener("click", function(){ animateClose(overlay); });
    overlay.addEventListener("click", function(e){ if(e.target===overlay) animateClose(overlay); });
  }

  /* — TEAM — */
  function renderTeam(){
    var c = DATA.contact;
    var h = '<div class="section">';
    h += '<h2>Лица канала</h2>';
    h += '<div class="team-grid">';
    DATA.team.forEach(function(m){
      h += '<div class="member"><img src="'+m.img+'" alt="'+m.name+'" loading="lazy">';
      h += '<div class="m-info"><h3>'+m.name+'</h3><p>'+m.desc+'</p></div></div>';
    });
    h += '</div></div>';

    h += '<div class="section"><h2>Спонсор</h2>';
    h += '<div class="team-grid"><div class="member">';
    h += '<img src="'+DATA.sponsor.img+'" alt="'+DATA.sponsor.name+'" loading="lazy">';
    h += '<div class="m-info"><h3>'+DATA.sponsor.name+'</h3><p>'+DATA.sponsor.desc+'</p></div>';
    h += '</div></div></div>';

    h += '<div class="section"><h2>Контакты</h2>';
    h += '<div class="contacts">';
    h += '<p>📞 '+c.phone+'</p>';
    h += '<p>📧 <a href="mailto:'+c.email+'">'+c.email+'</a></p>';
    h += '<p>📡 '+c.address+'</p>';
    h += '<p><a href="'+c.youtube+'" target="_blank" rel="noopener">📺 YouTube</a></p>';
    h += '</div></div>';

    app.innerHTML = h;
  }

  /* ═══ TICKER (reusable) ═══ */
  function ticker(){
    return '<div class="ticker"><div class="ticker-inner">'+DATA.ticker+'</div></div>';
  }

})();
