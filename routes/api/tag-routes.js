const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

router.get('/', async (req, res) => {

  try {
    const tagData = await Tag.findAll({
      include: { 
        model: Product,
        through: ProductTag,
        as: 'tag_id'
      },
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {

  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: { 
        model: Product,
        through: ProductTag,
        as: 'tag_id'
      },
    });

    if (!tagData) {
      res.status(404).json({ message: 'No such tag found!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const tagData = await Tag.create(req.body);
    res.status(200).json(tagData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', (req, res) => {
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      return ProductTag.findAll({ where: { tag_id: req.params.id } });
    })
    .then((tags) => {
      const tagIds = tags.map(({ tag_id }) => tag_id);
      const newTags = tagIds
        .filter((tag_id) => !tagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      const tagsToRemove = tags
        .filter(({ tag_id }) => !tagIds.includes(tag_id))
        .map(({ id }) => id);

      return Promise.all([
        Tag.destroy({ where: { id: tagsToRemove } }),
        Tag.bulkCreate(newTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with that id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
