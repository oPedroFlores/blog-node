const express = require('express');
const router = express.Router();
const Article = require('./Article');
const Category = require('../categories/Category');
const slugify = require('slugify');
const adminAuth = require('../middlewares/adminAuth');

router.get('/admin/articles', adminAuth.authenticate, (req, res) => {
  Article.findAll({
    include: [{ model: Category }],
  }).then((articles) => {
    res.render('admin/articles/index', {
      session: req.session,
      articles: articles,
    });
  });
});

router.get('/admin/articles/new', adminAuth.authenticate, (req, res) => {
  Category.findAll().then((categories) => {
    res.render('admin/articles/new', {
      session: req.session,
      categories: categories,
    });
  });
});

router.post('/articles/save', adminAuth.authenticate, (req, res) => {
  let title = req.body.title;
  let body = req.body.body;
  let category = req.body.category;

  Article.create({
    title: title,
    slug: slugify(title),
    body: body,
    categoryId: category,
  }).then(() => {
    res.redirect('/admin/articles');
  });
});

router.post('/articles/delete', adminAuth.authenticate, (req, res) => {
  let id = req.body.id;
  if (id != undefined) {
    if (!isNaN(id)) {
      Article.destroy({
        where: {
          id: id,
        },
      }).then(() => {
        res.redirect('/admin/articles');
      });
    } else {
      // ID NÃO É NÚMERO
      res.redirect('/admin/articles');
    }
  } else {
    //ID NULO
    res.redirect('/admin/articles');
  }
});

//Editar listagem

router.get('/admin/articles/edit/:id', adminAuth.authenticate, (req, res) => {
  debugger;
  let id = req.params.id;
  if (isNaN(id)) {
    res.redirect('/admin/articles');
  }

  Article.findByPk(id)
    .then((article) => {
      if (article != undefined) {
        Category.findAll().then((categories) => {
          res.render('admin/articles/edit', {
            session: req.session,
            article: article,
            categories: categories,
          });
        });
      } else {
        res.redirect('/admin/articles');
      }
    })
    .catch((erro) => {
      res.redirect('/admin/articles');
    });
});

router.post('/articles/update', adminAuth.authenticate, (req, res) => {
  let id = req.body.id;
  let title = req.body.title;
  let body = req.body.body;
  let category = req.body.category;

  Article.update(
    { title: title, slug: slugify(title), body: body, categoryId: category },
    {
      where: {
        id: id,
      },
    },
  )
    .then(() => {
      res.redirect('/admin/articles');
    })
    .catch((err) => {
      res.redirect('/admin/articles');
    });
});

router.get('/articles/page/:num', (req, res) => {
  let page = req.params.num;
  let offset = 0;
  let limit = 3;
  if (isNaN(page) || page == 1) {
    offset = 0;
  } else {
    offset = (parseInt(page) - 1) * limit;
  }

  Article.findAndCountAll({
    limit: limit,
    offset: offset,
    order: [['id', 'DESC']],
  }).then((articles) => {
    let next = true;
    if (offset + limit >= articles.count) {
      next = false;
    }

    let result = {
      next: next,
      page: parseInt(page),
      articles: articles,
    };

    Category.findAll().then((categories) => {
      res.render('admin/articles/page', {
        session: req.session,
        result: result,
        categories: categories,
      });
    });
  });
});

module.exports = router;
