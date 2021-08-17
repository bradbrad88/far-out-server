"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
    -- Table: public.users
    -- DROP TABLE public.users;
    CREATE TABLE IF NOT EXISTS public.users
    (
        user_id SERIAL PRIMARY KEY,
        given_name character varying(255) COLLATE pg_catalog."default",
        family_name character varying(255) COLLATE pg_catalog."default",
        email character varying(255) COLLATE pg_catalog."default",
        image_url character varying(255) COLLATE pg_catalog."default",
        google_id character varying(255) COLLATE pg_catalog."default",
        user_state json,
        admin boolean DEFAULT false,
        CONSTRAINT users_email_key UNIQUE (email),
        CONSTRAINT users_google_id_key UNIQUE (google_id)
    )
    TABLESPACE pg_default;
    ALTER TABLE public.users
        OWNER to postgres;
    
    -- Table: public.image_gallery
    -- DROP TABLE public.image_gallery;
    CREATE TABLE IF NOT EXISTS public.image_gallery
    (
        image_id SERIAL PRIMARY KEY,
        image_desc text COLLATE pg_catalog."default",
        date_uploaded timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        likes integer,
        uploaded_by integer,
        complete boolean DEFAULT false,
        CONSTRAINT image_gallery_uploaded_by_fkey FOREIGN KEY (uploaded_by)
            REFERENCES public.users (user_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
    )
    TABLESPACE pg_default;
    ALTER TABLE public.image_gallery
        OWNER to postgres;

    -- Table: public.blogs
    -- DROP TABLE public.blogs;
    CREATE TABLE IF NOT EXISTS public.blogs
    (
        blog_id SERIAL PRIMARY KEY,
        title character varying(255) COLLATE pg_catalog."default" NOT NULL,
        image integer,
        blog_desc text COLLATE pg_catalog."default",
        html text COLLATE pg_catalog."default",
        date_created timestamp with time zone DEFAULT now(),
        last_modified timestamp without time zone,
        active boolean DEFAULT false,
        CONSTRAINT blogs_image_fkey FOREIGN KEY (image)
            REFERENCES public.image_gallery (image_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE SET NULL
    )
    TABLESPACE pg_default;
    ALTER TABLE public.blogs
        OWNER to postgres;

    -- Table: public.gallery_settings
    -- DROP TABLE public.gallery_settings;
    CREATE TABLE IF NOT EXISTS public.gallery_settings
    (
        single_row boolean DEFAULT false,
        gallery_columns integer,
        thumbnail_render_width integer,
        CONSTRAINT gallery_settings_single_row_key UNIQUE (single_row),
        CONSTRAINT gallery_settings_single_row_check CHECK (single_row = false)
    )
    TABLESPACE pg_default;
    ALTER TABLE public.gallery_settings
        OWNER to postgres;

    -- Table: public.image_display
    -- DROP TABLE public.image_display;
    CREATE TABLE IF NOT EXISTS public.image_display
    (
        image_id integer,
        x integer,
        y integer,
        w integer,
        h integer,
        CONSTRAINT image_display_image_id_fkey FOREIGN KEY (image_id)
            REFERENCES public.image_gallery (image_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE
    )
    TABLESPACE pg_default;
    ALTER TABLE public.image_display
        OWNER to postgres;

    -- Table: public.image_urls
    -- DROP TABLE public.image_urls;
    CREATE TABLE IF NOT EXISTS public.image_urls
    (
        image_url_id SERIAL PRIMARY KEY,
        resolution character varying(20) COLLATE pg_catalog."default",
        image_id integer,
        aws_key character varying(255) COLLATE pg_catalog."default",
        bucket character varying(255) COLLATE pg_catalog."default",
        url character varying(255) COLLATE pg_catalog."default",
        blog_id integer,
        CONSTRAINT image_urls_blog_id_fkey FOREIGN KEY (blog_id)
            REFERENCES public.blogs (blog_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE,
        CONSTRAINT image_urls_image_id_fkey FOREIGN KEY (image_id)
            REFERENCES public.image_gallery (image_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE
    )
    
    TABLESPACE pg_default;
    ALTER TABLE public.image_urls
        OWNER to postgres;

    -- Table: public.user_comments
    -- DROP TABLE public.user_comments;
    CREATE TABLE IF NOT EXISTS public.user_comments
    (
        comment_id SERIAL PRIMARY KEY,
        user_id integer,
        blog_id integer,
        image_id integer,
        comment_body text COLLATE pg_catalog."default",
        date_created timestamp with time zone DEFAULT now(),
        parent_id integer,
        CONSTRAINT user_comments_blog_id_fkey FOREIGN KEY (blog_id)
            REFERENCES public.blogs (blog_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE,
        CONSTRAINT user_comments_image_id_fkey FOREIGN KEY (image_id)
            REFERENCES public.image_gallery (image_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE,
        CONSTRAINT user_comments_parent_id_fkey FOREIGN KEY (parent_id)
            REFERENCES public.user_comments (comment_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE,
        CONSTRAINT user_comments_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (user_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE SET NULL
    )
    TABLESPACE pg_default;
    ALTER TABLE public.user_comments
        OWNER to postgres;
        
    CREATE OR REPLACE VIEW public.image_highres
    AS
    SELECT g.image_id,
        u.url
        FROM image_gallery g
        JOIN image_urls u ON g.image_id = u.image_id
        WHERE u.resolution::text = 'highres'::text;
    
    ALTER TABLE public.image_highres
        OWNER TO postgres;
    
    CREATE OR REPLACE VIEW public.image_thumbnails
    AS
    SELECT g.image_id,
        u.url
        FROM image_gallery g
        JOIN image_urls u ON g.image_id = u.image_id
        WHERE u.resolution::text = 'thumbnail'::text;
    
    ALTER TABLE public.image_thumbnails
        OWNER TO postgres;

        `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropAllTables();
  },
};
