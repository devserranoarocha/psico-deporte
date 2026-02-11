<?php

namespace App\Controller;

use App\Entity\News;
use App\Repository\NewsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/news', name: 'api_news_')]
final class NewsController extends AbstractController
{
    private $entityManager;
    private $repository;

    public function __construct(EntityManagerInterface $entityManager, NewsRepository $repository)
    {
        $this->entityManager = $entityManager;
        $this->repository = $repository;
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $news = $this->repository->findBy([], ['date' => 'DESC', 'id' => 'DESC']);
        $data = array_map(function(News $item) {
            return [
                'id' => $item->getId(),
                'title' => $item->getTitle(),
                'date' => $item->getDate()->format('Y-m-d'),
                'news_text' => $item->getNewsText(),
                'image' => $item->getImage(), 
            ];
        }, $news);
        return $this->json($data);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $title = $request->request->get('title');
        $text = $request->request->get('news_text');
        $dateStr = $request->request->get('date');
        $imageFile = $request->files->get('image');

        $news = new News();
        $news->setTitle($title);
        $news->setNewsText($text);
        $news->setDate(new \DateTime($dateStr ?: 'now'));

        // Control de imagen: Si no hay archivo, el campo 'image' en DB será NULL
        if ($imageFile) {
            $newFilename = uniqid().'.'.$imageFile->guessExtension();
            $imageFile->move($this->getParameter('news_images_directory'), $newFilename);
            $news->setImage($newFilename);
        } else {
            $news->setImage(null);
        }

        $this->entityManager->persist($news);
        $this->entityManager->flush();

        return $this->json(['message' => 'Noticia creada']);
    }

    #[Route('/{id}/update', name: 'update', methods: ['POST'])]
    public function update(Request $request, News $news): JsonResponse
    {
        $title = $request->request->get('title');
        $text = $request->request->get('news_text');
        $dateStr = $request->request->get('date');
        $imageFile = $request->files->get('image');

        if ($title) $news->setTitle($title);
        if ($text) $news->setNewsText($text);
        if ($dateStr) $news->setDate(new \DateTime($dateStr));

        if ($imageFile) {
            // Borramos la anterior solo si el usuario está subiendo una nueva
            if ($news->getImage()) {
                $oldPath = $this->getParameter('news_images_directory').'/'.$news->getImage();
                if (file_exists($oldPath)) unlink($oldPath);
            }

            $newFilename = uniqid().'.'.$imageFile->guessExtension();
            $imageFile->move($this->getParameter('news_images_directory'), $newFilename);
            $news->setImage($newFilename);
        }
        // Si no hay $imageFile, no hacemos nada (mantiene la imagen que ya tenía)

        $this->entityManager->flush();
        return $this->json(['message' => 'Actualizada']);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(News $news): JsonResponse
    {
        if ($news->getImage()) {
            $path = $this->getParameter('news_images_directory').'/'.$news->getImage();
            if (file_exists($path)) unlink($path);
        }

        $this->entityManager->remove($news);
        $this->entityManager->flush();
        return $this->json(['message' => 'Eliminada']);
    }
}