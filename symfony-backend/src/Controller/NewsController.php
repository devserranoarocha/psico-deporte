<?php

namespace App\Controller;

use App\Entity\News;
use App\Repository\NewsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
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
                'image' => $item->getImage(), // Devolvemos el nombre de la imagen
            ];
        }, $news);
        return $this->json($data);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        // Al usar FormData, los datos vienen en $request->request y $request->files
        $title = $request->request->get('title');
        $text = $request->request->get('news_text');
        $dateStr = $request->request->get('date');
        $imageFile = $request->files->get('image');

        if (!$title || !$text) {
            return $this->json(['error' => 'Faltan datos'], 400);
        }

        $news = new News();
        $news->setTitle($title);
        $news->setNewsText($text);
        $news->setDate(new \DateTime($dateStr ?: 'now'));

        if ($imageFile) {
            $newFilename = uniqid().'.'.$imageFile->guessExtension();
            $imageFile->move($this->getParameter('news_images_directory'), $newFilename);
            $news->setImage($newFilename);
        }

        $this->entityManager->persist($news);
        $this->entityManager->flush();
        return $this->json(['message' => 'Creada con éxito']);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Request $request, News $news): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) {
            $news->setTitle($data['title']);
        }

        if (isset($data['news_text'])) {
            $news->setNewsText($data['news_text']);
        }

        if (isset($data['date'])) {
            $news->setDate(new \DateTime($data['date']));
        }

        $this->entityManager->flush();

        return $this->json(['message' => 'Noticia actualizada correctamente']);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(News $news): JsonResponse
    {
        $this->entityManager->remove($news);
        $this->entityManager->flush();

        return $this->json(['message' => 'Noticia eliminada correctamente']);
    }
}