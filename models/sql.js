const mapValues = data => {
  return `(${data.map(item => item)})`;
};

const mapValueSets = data => {
  return `${data.map(item => {
    return `(${item.map(el => {
      return `'${el}'`;
    })})`.toString();
  })}`;
};

const mapSetOfObjects = data => {
  return `${data.map(item => {
    return `(${Object.keys(item).map(key => {
      return `'${item[key]}'`;
    })})`;
  })}`;
};

const mapSetOfObjectsWithId = (id, data) => {
  return `${data.map(item => {
    return `(${id}, ${Object.keys(item).map(key => {
      return `'${item[key]}'`;
    })})`;
  })}`;
};

exports.user = {
  getUserByLocalId: user_id => {
    return {
      text: `
      SELECT 
        user_id
      , given_name
      , family_name
      , email
      , image_url
      , admin
      FROM users
      WHERE user_id = $1`,
      values: [user_id],
    };
  },

  upsertUserGoogle: user => {
    return {
      text: `
        INSERT INTO users
        (given_name, family_name, email, image_url, google_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (google_id)
          DO UPDATE SET google_id=users.google_id, given_name=EXCLUDED.given_name, family_name=EXCLUDED.family_name, email=EXCLUDED.email, image_url=EXCLUDED.image_url
        RETURNING user_id, given_name, family_name, email, image_url, google_id, admin`,
      values: [
        user.given_name,
        user.family_name,
        user.email,
        user.picture,
        user.sub,
      ],
    };
  },
};

exports.gallery = {
  // get active images only
  get: () => {
    return `
    SELECT 
      g.image_id,
      image_desc,
      extract(epoch from date_uploaded) as date_uploaded,
      likes,
      h.url as highres,
      t.url as thumbnail,
      i,
      x,
      y,
      w,
      h,
      position,
      complete
    FROM image_gallery g LEFT JOIN image_thumbnails t ON g.image_id = t.image_id
    LEFT JOIN image_highres h on g.image_id = h.image_id
    INNER JOIN image_display d ON g.image_id = d.i`;
  },

  // get all images (active and banked)
  getAll: () => {
    return `
    SELECT
      g.image_id,
      image_desc,
      extract(epoch from date_uploaded) as date_uploaded,
      likes,
      t.url as thumbnail,
      i,
      x,
      y,
      w,
      h,
      position,
      complete,
      aspect_ratio
    FROM image_gallery g LEFT JOIN image_thumbnails t ON g.image_id = t.image_id
    LEFT JOIN image_display d ON g.image_id = d.i`;
  },

  delete: image_ids => {
    return {
      text: `DELETE FROM image_gallery
      WHERE image_id IN ${mapValues(image_ids)};`,
    };
  },

  // broken - redundant
  getInactive: () => {
    return `
    SELECT 
      g.image_id,
      image_desc,
      extract(epoch from date_uploaded) as date_uploaded,
      t.url as thumbnail,
      h.url as highres,
      complete
    FROM image_gallery g 
    LEFT JOIN image_thumbnails t ON g.image_id = t.image_id
    LEFT JOIN image_highres h on g.image_id = h.image_id
    LEFT JOIN image_display d ON g.image_id = d.image_id
    WHERE d.image_id IS NULL
    ORDER BY date_uploaded DESC`;
  },

  getAllImageThumbnails: () => {
    return `
    SELECT
      g.image_id,
      extract(epoch from date_uploaded) as date_uploaded,
      url
    FROM image_gallery g INNER JOIN image_urls u ON g.image_id = u.image_id
    WHERE u.resolution = 'thumbnail' AND complete = true
    ORDER BY date_uploaded DESC`;
  },

  setDisplay: displayData => {
    console.log(displayData);
    const values = mapSetOfObjects(displayData);
    const query = `
    DELETE FROM image_display *;
    INSERT INTO image_display (i, x, y, w, h, position)
    VALUES ${values}`;
    console.log(query);
    return query;
  },

  setComplete: (image_id, aspectRatio) => {
    return {
      text: `
    UPDATE image_gallery
    SET complete = true, aspect_ratio = $2
    WHERE image_id = $1`,
      values: [image_id, aspectRatio],
    };
  },

  newImage: (user, count) => {
    const values = () => {
      let result = `(${user})`;
      for (let i = 1; i < count; i++) {
        result = result.concat(`, (${user})`);
      }
      return result;
    };
    // return values();
    return `INSERT INTO image_gallery (uploaded_by) VALUES ${values()} RETURNING image_id`;
  },

  addUrls: data => {
    const values = mapValueSets(data);
    return `
    INSERT INTO image_urls (image_id, url, aws_key, bucket, resolution) 
    VALUES ${values}`;
  },

  getAwsKeys: () => {
    return `
    SELECT aws_key
    FROM image_urls`;
  },

  deleteDisplay: () => {
    return `
    DELETE FROM image_display *`;
  },

  removeStaleImages: () => {
    return `
    DELETE FROM image_gallery
    WHERE complete=false AND date_uploaded < now() - INTERVAL '20 seconds'`;
  },
};

exports.blog = {
  newBlog: blog => {
    return {
      text: `
        INSERT INTO blogs (
          title,
          image,
          blog_desc,
          html)
        VALUES ($1, $2, $3, $4)
        RETURNING blog_id`,
      values: [blog.title, blog.image, blog.description, blog.html],
    };
  },
  editBlog: blog => {
    return {
      text: `
        UPDATE blogs
        SET 
          title=$2,
          html=$3,
          image=$4,
          blog_desc=$5
        WHERE blog_id=$1
      `,
      values: [blog.blog_id, blog.title, blog.html, blog.image, blog.description],
    };
  },
  getActiveBlogs: () => {
    return `
    SELECT
      blog_id,
      title,
      date_created,
      blog_desc,
      t.url AS thumbnail,
      h.url AS highres,
      active
    FROM blogs b  LEFT JOIN image_thumbnails t ON b.image = t.image_id
    LEFT JOIN image_highres h ON b.image = h.image_id
    WHERE active=true
    ORDER BY date_created DESC`;
  },
  getAllBlogs: () => {
    return `
    SELECT
      blog_id,
      title,
      date_created,
      blog_desc,
      t.url AS thumbnail,
      h.url AS highres,
      active
    FROM blogs b  LEFT JOIN image_thumbnails t ON b.image = t.image_id
    LEFT JOIN image_highres h ON b.image = h.image_id
    ORDER BY date_created DESC`;
  },
  getBlog: blog_id => {
    return {
      text: `
        SELECT
          blog_id,
          title,
          image,
          blog_desc,
          html,
          extract(epoch FROM date_created) as date_created,
          extract(epoch FROM last_modified) as last_modified,
          active,
          t.url as thumbnail,
          h.url as highres
        FROM blogs b LEFT JOIN image_thumbnails t ON b.image = t.image_id
        LEFT JOIN image_highres h ON b.image = h.image_id 
        WHERE blog_id=($1)`,
      values: [blog_id],
    };
  },
  setActive: (blog_id, active) => {
    return {
      text: `
      UPDATE blogs
      SET active=$2
      WHERE blog_id=$1`,
      values: [blog_id, active],
    };
  },
  deleteBlog: blog_id => {
    return {
      text: `DELETE FROM blogs
      WHERE blog_id=$1`,
      values: [blog_id],
    };
  },
  setImageUrls: (blog_id, images) => {
    const values = mapSetOfObjectsWithId(blog_id, images);
    return `
      DELETE FROM image_urls
      WHERE blog_id=${blog_id};
      INSERT INTO image_urls (blog_id, aws_key, url, bucket)
      VALUES ${values}`;
  },
};

exports.comments = {
  newComment: (user, comment) => ({
    text: `
      INSERT INTO user_comments (user_id, blog_id, image_id, comment_body, parent_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING comment_id`,
    values: [
      user.user_id,
      comment.blog_id,
      comment.image_id,
      comment.comment_body,
      comment.parent_id,
    ],
  }),
  getImage: image_id => ({
    text: `
      SELECT 
        comment_id,
        image_id,
        c.user_id,
        u.given_name,
        u.family_name,
        u.image_url,
        comment_body,
        EXTRACT(epoch from date_created) as date_created,
        parent_id
      FROM user_comments c LEFT JOIN users u ON c.user_id=u.user_id
      WHERE image_id=$1`,
    values: [image_id],
  }),
};
