<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\User;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // $users = User::all();
        // $categories = Category::all();
        // $tags = Tag::all();

        // if ($users->isEmpty() || $categories->isEmpty()) {
        //     return;
        // }

        // for ($i = 1; $i <= 10; $i++) {
        //     $title = "Sample Post " . $i;
        //     $post = Post::create([
        //         'user_id' => $users->random()->id,
        //         'category_id' => $categories->random()->id,
        //         'title' => $title,
        //         'slug' => Str::slug($title) . '-' . uniqid(),
        //         'content' => "This is the content for sample post $i. It contains some text to represent a typical blog post content.",
        //         'status' => $i % 2 == 0 ? 'published' : 'draft',
        //         'published_at' => $i % 2 == 0 ? now() : null,
        //     ]);

        //     if ($tags->isNotEmpty()) {
        //         $post->tags()->attach($tags->random(rand(1, 3))->pluck('id'));
        //     }
        // }
    }
}
