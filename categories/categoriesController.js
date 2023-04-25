const express = require('express');
const router = express.Router();
const Category = require('./Category');
const slugify = require('slugify');
const adminAuth = require('../middlewares/adminAuth');

router.get('/admin/categories/new', adminAuth.authenticate, (req, res) => {
  res.render('admin/categories/new', {
    session: req.session,
  });
});

router.post('/categories/save', adminAuth.authenticate, (req, res) => {
  let title = req.body.title;
  if (title != undefined) {
    Category.create({
      title: title,
      slug: slugify(title),
    }).then(() => {
      res.redirect('/admin/categories');
    });
  } else {
    res.redirect('/admin/categories/new');
  }
});

router.get('/admin/categories', adminAuth.authenticate, (req, res) => {
  Category.findAll().then((categories) => {
    res.render('admin/categories/index', {
      session: req.session,
      categories: categories,
    });
  });
});

//Deletar listagem
router.post('/categories/delete', adminAuth.authenticate, (req, res) => {
  let id = req.body.id;
  if (id != undefined) {
    if (!isNaN(id)) {
      Category.destroy({
        where: {
          id: id,
        },
      }).then(() => {
        res.redirect('/admin/categories');
      });
    } else {
      // ID NÃO É NÚMERO
      res.redirect('/admin/categories');
    }
  } else {
    //ID NULO
    res.redirect('/admin/categories');
  }
});

//Editar listagem

router.get('/admin/categories/edit/:id', (req, res) => {
  let id = req.params.id;
  if (isNaN(id)) {
    res.redirect('/admin/categories');
  }

  Category.findByPk(id)
    .then((category) => {
      if (category != undefined) {
        res.render('admin/categories/edit', {
          session: req.session,
          category: category,
        });
      } else {
        res.redirect('/admin/categories');
      }
    })
    .catch((erro) => {
      res.redirect('/admin/categories');
    });
});

router.post('/categories/update', adminAuth.authenticate, (req, res) => {
  let id = req.body.id;
  let title = req.body.title;

  Category.update(
    { title: title, slug: slugify(title) },
    {
      where: {
        id: id,
      },
    },
  ).then(() => {
    res.redirect('/admin/categories');
  });
});

module.exports = router;
